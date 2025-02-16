"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { ChartData } from '@/types/case.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StackedBarChartProps {
  data: ChartData['resolutionTrends'];
  title: string;
}

export function StackedBarChart({ data, title }: StackedBarChartProps) {
  const options = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    },
    plugins: {
      title: {
        display: true,
        text: title
      },
      legend: {
        position: 'top' as const
      }
    }
  };

  return <Bar data={data} options={options} />;
} 