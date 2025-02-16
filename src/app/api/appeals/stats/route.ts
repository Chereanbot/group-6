import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      total,
      pending,
      scheduled,
      heard,
      decided,
      withdrawn,
      resolvedAppeals
    ] = await Promise.all([
      prisma.appeal.count(),
      prisma.appeal.count({ where: { status: 'PENDING' } }),
      prisma.appeal.count({ where: { status: 'SCHEDULED' } }),
      prisma.appeal.count({ where: { status: 'HEARD' } }),
      prisma.appeal.count({ where: { status: 'DECIDED' } }),
      prisma.appeal.count({ where: { status: 'WITHDRAWN' } }),
      prisma.appeal.findMany({
        where: { 
          status: 'DECIDED',
          decidedAt: { not: null },
          filedDate: { not: null }
        },
        select: {
          filedDate: true,
          decidedAt: true,
          decision: true
        }
      })
    ]);

    // Calculate average resolution time
    const totalResolutionTime = resolvedAppeals.reduce((acc, appeal) => {
      if (appeal.decidedAt && appeal.filedDate) {
        return acc + (appeal.decidedAt.getTime() - appeal.filedDate.getTime());
      }
      return acc;
    }, 0);

    const averageResolutionTime = resolvedAppeals.length > 0
      ? Math.round(totalResolutionTime / resolvedAppeals.length / (1000 * 60 * 60 * 24)) // Convert to days
      : 0;

    // Calculate success rate (appeals with favorable decisions)
    const successfulAppeals = resolvedAppeals.filter(appeal => 
      appeal.decision?.toLowerCase().includes('granted') || 
      appeal.decision?.toLowerCase().includes('approved')
    ).length;

    const successRate = resolvedAppeals.length > 0
      ? Math.round((successfulAppeals / resolvedAppeals.length) * 100)
      : 0;

    return NextResponse.json({
      total,
      pending,
      scheduled,
      heard,
      decided,
      withdrawn,
      averageResolutionTime,
      successRate
    });
  } catch (error) {
    console.error('Error fetching appeal stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appeal stats' },
      { status: 500 }
    );
  }
} 