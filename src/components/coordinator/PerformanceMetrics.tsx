import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { toast } from 'react-hot-toast';

interface PerformanceData {
  successRate: number;
  responseTime: number;
  clientSatisfaction: number;
  resolutionRate: number;
}

export function PerformanceMetrics() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PerformanceData | null>(null);

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

      setMetrics(result.data.performanceMetrics);
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
    if (!chartRef.current || isLoading || error || !metrics) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const data = {
      labels: [
        'Success Rate',
        'Client Satisfaction',
        'Resolution Rate',
        'Response Time Score'
      ],
      datasets: [
        {
          label: 'Performance',
          data: [
            metrics.successRate,
            metrics.clientSatisfaction,
            metrics.resolutionRate,
            // Convert response time to a score (lower is better)
            Math.max(0, 100 - (metrics.responseTime / 24 * 100)) // Convert hours to percentage
          ],
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(59, 130, 246)',
        },
      ],
    };

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              beginAtZero: true,
              ticks: {
                stepSize: 20,
                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151',
              },
              pointLabels: {
                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151',
              },
              grid: {
                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              angleLines: {
                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  if (context.label === 'Response Time Score') {
                    const hours = Math.round((100 - value) / 100 * 24 * 10) / 10;
                    return `Average Response Time: ${hours} hours`;
                  }
                  return `${context.label}: ${Math.round(value)}%`;
                }
              }
            }
          },
        },
      });
    }
  }, [metrics, isLoading, error]);

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
      {metrics && (
        <div className="absolute top-0 right-0 p-4 space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Response Time: {metrics.responseTime} hours
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Success Rate: {metrics.successRate}%
          </div>
        </div>
      )}
    </div>
  );
} 