import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Mock traffic metrics
    const trafficMetrics = {
      newCases: {
        count: 45,
        trend: 12
      },
      resolvedCases: {
        count: 38,
        trend: 8
      },
      averageResolutionTime: {
        days: 15,
        trend: 2
      }
    };

    return NextResponse.json(trafficMetrics);
  } catch (error) {
    console.error('Error fetching traffic metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch traffic metrics' }, { status: 500 });
  }
} 