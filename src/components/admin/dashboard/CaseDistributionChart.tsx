"use client";

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useTheme } from 'next-themes';

Chart.register(...registerables);

interface CaseDistributionProps {
  data: Array<{
    category: string;
    count: number;
  }>;
}

const CaseDistributionChart = ({ data }: CaseDistributionProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = data.map(item => item.category);
    const values = data.map(item => item.count);

    // Color palette for different case categories
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#6366F1', // indigo
      '#14B8A6'  // teal
    ];

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: theme === 'dark' ? '#E5E7EB' : '#374151',
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: 'Case Distribution by Category',
            color: theme === 'dark' ? '#E5E7EB' : '#374151',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        cutout: '60%',
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, theme]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div style={{ height: '400px' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default CaseDistributionChart; 