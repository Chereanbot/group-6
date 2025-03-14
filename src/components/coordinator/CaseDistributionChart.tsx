import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { toast } from 'react-hot-toast';

interface CaseDistribution {
  category: string;
  count: number;
}

const CATEGORY_COLORS = {
  FAMILY: '#3B82F6',      // blue
  CRIMINAL: '#10B981',    // green
  CIVIL: '#F59E0B',      // yellow
  PROPERTY: '#EF4444',   // red
  LABOR: '#8B5CF6',     // purple
  COMMERCIAL: '#EC4899', // pink
  CONSTITUTIONAL: '#6366F1', // indigo
  ADMINISTRATIVE: '#14B8A6', // teal
  OTHER: '#6B7280',     // gray
};

export function CaseDistributionChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distribution, setDistribution] = useState<CaseDistribution[]>([]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/coordinator/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch metrics');
      }

      setDistribution(result.data.caseDistribution);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load metrics';
      console.error('Error fetching metrics:', error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || isLoading || error) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const categories = distribution.map(d => d.category);
    const counts = distribution.map(d => d.count);
    const colors = categories.map(category => CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6B7280');

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: counts,
            backgroundColor: colors,
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle',
                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151',
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const total = counts.reduce((a, b) => a + b, 0);
                  const percentage = ((context.raw as number) / total * 100).toFixed(1);
                  return `${context.label}: ${context.raw} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%',
        },
      });
    }
  }, [distribution, isLoading, error]);

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] relative">
      <canvas ref={chartRef} />
    </div>
  );
} 