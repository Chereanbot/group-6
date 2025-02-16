"use client";

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { ChartData } from '@/types/case.types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: ChartData['complexityData'];
}

export function RadarChart({ data }: RadarChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true
      }
    }
  };

  return <Radar data={data} options={options} />;
} 