"use client";

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useTheme } from 'next-themes';

Chart.register(...registerables);

interface PerformanceMetricsProps {
  data: {
    successRate: number;
    avgResolutionTime: number;
    clientSatisfaction: number;
  };
}

const PerformanceMetrics = ({ data }: PerformanceMetricsProps) => {
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
      type: 'radar',
      data: {
        labels: [
          'Success Rate',
          'Resolution Time',
          'Client Satisfaction'
        ],
        datasets: [{
          label: 'Current Performance',
          data: [
            data.successRate,
            100 - (data.avgResolutionTime / 30) * 100, // Convert days to percentage (max 30 days)
            data.clientSatisfaction
          ],
          backgroundColor: theme === 'dark' 
            ? 'rgba(59, 130, 246, 0.2)' 
            : 'rgba(59, 130, 246, 0.5)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
          pointHoverBackgroundColor: '#FFFFFF',
          pointHoverBorderColor: '#3B82F6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              color: theme === 'dark' ? '#E5E7EB' : '#374151'
            },
            grid: {
              color: theme === 'dark' ? '#374151' : '#E5E7EB'
            },
            pointLabels: {
              color: theme === 'dark' ? '#E5E7EB' : '#374151',
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Performance Metrics',
            color: theme === 'dark' ? '#E5E7EB' : '#374151',
            font: {
              size: 16,
              weight: 'bold'
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
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
          <p className="text-2xl font-semibold text-blue-600">{data.successRate.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Resolution</p>
          <p className="text-2xl font-semibold text-green-600">{data.avgResolutionTime} days</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Client Satisfaction</p>
          <p className="text-2xl font-semibold text-purple-600">{data.clientSatisfaction}%</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics; 