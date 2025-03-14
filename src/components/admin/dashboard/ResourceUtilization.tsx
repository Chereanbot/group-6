"use client";

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useTheme } from 'next-themes';

Chart.register(...registerables);

interface ResourceUtilizationProps {
  data: Array<{
    resource: string;
    utilization: number;
  }>;
}

const ResourceUtilization = ({ data }: ResourceUtilizationProps) => {
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

    const labels = data.map(item => item.resource);
    const values = data.map(item => item.utilization);

    // Create gradient for bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, theme === 'dark' ? '#3B82F6' : '#60A5FA');
    gradient.addColorStop(1, theme === 'dark' ? '#1D4ED8' : '#2563EB');

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Utilization Rate',
          data: values,
          backgroundColor: gradient,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Resource Utilization',
            color: theme === 'dark' ? '#E5E7EB' : '#374151',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: theme === 'dark' ? '#374151' : '#E5E7EB',
              drawBorder: false,
            },
            ticks: {
              color: theme === 'dark' ? '#E5E7EB' : '#374151',
              callback: (value) => `${value}%`
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              color: theme === 'dark' ? '#E5E7EB' : '#374151',
              font: {
                size: 12
              }
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
  }, [data, theme]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div style={{ height: '400px' }}>
        <canvas ref={chartRef} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.resource} className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.resource}</p>
            <p className={`text-2xl font-semibold ${
              item.utilization > 80 ? 'text-red-600' :
              item.utilization > 60 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {item.utilization.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceUtilization; 