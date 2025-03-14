import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized: Please login first' },
      { status: 401 }
    );
  }

  if (userRole !== 'LAWYER') {
    return NextResponse.json(
      { error: 'Unauthorized: Only lawyers can access this data' },
      { status: 403 }
    );
  }

  try {
    const cases = await prisma.case.findMany({
      where: {
        lawyerId: userId,
        OR: [
          { status: 'ACTIVE' },
          { status: 'PENDING' }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        complexityScore: true,
        riskLevel: true,
        resourceIntensity: true,
        stakeholderImpact: true,
        totalBillableHours: true,
        documentCount: true,
        createdAt: true,
        expectedResolutionDate: true
      }
    });

    // Transform the data and calculate progress
    const transformedCases = cases.map(c => {
      // Calculate progress based on multiple factors
      let progress = 0;
      
      // Base progress from metrics (each metric contributes up to 20%)
      const metricsProgress = (
        (c.complexityScore / 10) * 20 +
        (c.riskLevel / 10) * 20 +
        (c.resourceIntensity / 10) * 20 +
        (c.stakeholderImpact / 10) * 20
      );
      
      // Time-based progress (20%)
      let timeProgress = 0;
      if (c.expectedResolutionDate) {
        const totalDuration = c.expectedResolutionDate.getTime() - c.createdAt.getTime();
        const elapsed = Date.now() - c.createdAt.getTime();
        timeProgress = Math.min((elapsed / totalDuration) * 20, 20);
      }
      
      // Calculate final progress
      progress = Math.min(Math.round(metricsProgress + timeProgress), 100);

      return {
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority,
        complexityScore: c.complexityScore,
        progress
      };
    });

    return NextResponse.json({
      cases: transformedCases,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching case progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 