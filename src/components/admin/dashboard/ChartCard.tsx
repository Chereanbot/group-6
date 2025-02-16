"use client";

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useTheme } from 'next-themes';

Chart.register(...registerables);

interface ChartCardProps {
  title: string;
  data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }>;
  };
  type?: 'line' | 'bar';
  height?: number;
  loading?: boolean;
}

const ChartCard = ({ 
  title, 
  data = {
    labels: [],
    datasets: [{
      label: 'No Data',
      data: [],
      borderColor: '#6B7280',
      backgroundColor: '#6B728033'
    }]
  },
  type = 'line',
  height = 300,
  loading = false 
}: ChartCardProps) => {
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

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: theme === 'dark' ? '#E5E7EB' : '#374151'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: theme === 'dark' ? '#374151' : '#E5E7EB'
            },
            ticks: {
              color: theme === 'dark' ? '#E5E7EB' : '#374151'
            }
          },
          x: {
            grid: {
              color: theme === 'dark' ? '#374151' : '#E5E7EB'
            },
            ticks: {
              color: theme === 'dark' ? '#E5E7EB' : '#374151'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, theme, type]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
      </div>
    </div>
  );
};

export default ChartCard; 