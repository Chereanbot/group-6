import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalCases, activeCases, resolvedCases, highPriorityCases] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: 'ACTIVE' } }),
      prisma.case.count({ where: { status: 'RESOLVED' } }),
      prisma.case.count({ where: { priority: 'HIGH' } })
    ]);

    const metrics = {
      totalCases,
      activeCases,
      resolvedCases,
      highPriorityCases,
      // ... other metrics ...
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 