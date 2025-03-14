import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculateCaseProgress } from '@/lib/case-progress';

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
    // Fetch all cases for the lawyer
    const cases = await prisma.case.findMany({
      where: {
        lawyerId: userId,
      },
      include: {
        timeEntries: {
          where: {
            status: 'COMPLETED'
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 100
        }
      }
    });

    // Calculate monthly activity data
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthCases = cases.filter(c => {
        const createdAt = new Date(c.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      return {
        month: month.toLocaleString('default', { month: 'short' }),
        totalCases: monthCases.length,
        completedCases: monthCases.filter(c => c.status === 'RESOLVED').length,
        pendingCases: monthCases.filter(c => c.status === 'PENDING').length,
        activeCases: monthCases.filter(c => c.status === 'ACTIVE').length
      };
    }).reverse();

    // Calculate case complexity distribution
    const complexityDistribution = cases.reduce((acc, c) => {
      const level = c.complexityScore <= 3 ? 'Low' :
                    c.complexityScore <= 7 ? 'Medium' : 'High';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate service type distribution
    const serviceTypes = cases.flatMap(c => 
      c.timeEntries.map(e => e.serviceType)
    ).reduce((acc, type) => {
      if (type) {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate case category distribution
    const categoryDistribution = cases.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate recent activity trends
    const activityTrends = cases.flatMap(c => c.activities)
      .reduce((acc, activity) => {
        const date = new Date(activity.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return NextResponse.json({
      monthlyData,
      complexityDistribution,
      serviceTypes,
      categoryDistribution,
      activityTrends,
      totalCases: cases.length,
      activeCases: cases.filter(c => c.status === 'ACTIVE').length,
      completedCases: cases.filter(c => c.status === 'RESOLVED').length,
      pendingCases: cases.filter(c => c.status === 'PENDING').length
    });
  } catch (error) {
    console.error('Error fetching case analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 