import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ChartData } from '@/types/case.types';

export async function GET() {
  try {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    const chartData: ChartData = {
      progressData: {
        labels: months,
        datasets: [{
          label: 'Cases',
          data: months.map(() => Math.floor(Math.random() * 50)),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }]
      },
      resolutionData: {
        labels: ['< 1 week', '1-2 weeks', '2-4 weeks', '> 4 weeks'],
        datasets: [{
          label: 'Cases',
          data: [20, 35, 25, 10],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      resolutionTrends: {
        labels: months,
        datasets: [
          {
            label: 'Resolved',
            data: months.map(() => Math.floor(Math.random() * 30)),
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            stack: 'Stack 0',
          },
          {
            label: 'Pending',
            data: months.map(() => Math.floor(Math.random() * 20)),
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            stack: 'Stack 0',
          }
        ]
      },
      complexityData: {
        labels: ['Documentation', 'Legal Complexity', 'Time Sensitivity', 'Resource Requirements', 'Stakeholder Impact', 'Risk Level'],
        datasets: [{
          label: 'Current Period',
          data: [85, 70, 60, 75, 80, 65],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          fill: true
        }]
      }
    };

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
} 