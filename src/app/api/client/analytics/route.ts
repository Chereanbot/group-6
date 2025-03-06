import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyAuth(token.value);

    if (!payload || payload.role !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Get all cases for the client
    const cases = await prisma.case.findMany({
      where: {
        clientId: payload.id
      },
      include: {
        appointments: true,
        documents: true,
        payments: true
      }
    });

    // Calculate total cases and status counts
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'ACTIVE').length;
    const resolvedCases = cases.filter(c => c.status === 'RESOLVED').length;
    const pendingCases = cases.filter(c => c.status === 'PENDING').length;

    // Calculate case types distribution
    const casesByType = Object.entries(
      cases.reduce((acc: Record<string, number>, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({
      type,
      count,
      trend: 0 // Calculate trend based on historical data if available
    }));

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthCases = cases.filter(c => {
        const caseDate = new Date(c.createdAt);
        return caseDate >= monthStart && caseDate <= monthEnd;
      });

      const resolvedInMonth = cases.filter(c => {
        const resolvedDate = new Date(c.updatedAt);
        return c.status === 'RESOLVED' && resolvedDate >= monthStart && resolvedDate <= monthEnd;
      });

      return {
        month: date.toLocaleString('default', { month: 'short' }),
        newCases: monthCases.length,
        resolvedCases: resolvedInMonth.length,
        avgResolutionDays: resolvedInMonth.length > 0
          ? resolvedInMonth.reduce((acc, c) => {
              const days = Math.floor(
                (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 
                (1000 * 60 * 60 * 24)
              );
              return acc + days;
            }, 0) / resolvedInMonth.length
          : 0
      };
    }).reverse();

    // Calculate priority distribution
    const priorityDistribution = ['HIGH', 'MEDIUM', 'LOW'].map(priority => {
      const count = cases.filter(c => c.priority === priority).length;
      return {
        priority,
        count,
        percentage: totalCases > 0 ? (count / totalCases) * 100 : 0
      };
    });

    // Calculate average resolution time
    const resolvedWithDates = cases.filter(c => 
      c.status === 'RESOLVED' && c.createdAt && c.updatedAt
    );
    
    const averageResolutionTime = resolvedWithDates.length > 0
      ? resolvedWithDates.reduce((acc, c) => {
          const days = Math.floor(
            (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          return acc + days;
        }, 0) / resolvedWithDates.length
      : 0;

    // Calculate success rate
    const successRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;

    // Calculate case timeline data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const caseTimeline = cases
      .filter(c => new Date(c.createdAt) >= thirtyDaysAgo)
      .reduce((acc: Record<string, any>, c) => {
        const date = new Date(c.createdAt).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            count: 0,
            resolved: 0,
            pending: 0
          };
        }
        acc[date].count += 1;
        if (c.status === 'RESOLVED') acc[date].resolved += 1;
        if (c.status === 'PENDING') acc[date].pending += 1;
        return acc;
      }, {});

    // Calculate case insights
    const previousMonthCases = monthlyTrends[4]?.newCases || 0;
    const currentMonthCases = monthlyTrends[5]?.newCases || 0;
    const casesChange = previousMonthCases > 0
      ? ((currentMonthCases - previousMonthCases) / previousMonthCases) * 100
      : 0;

    const caseInsights = [
      {
        title: 'New Cases',
        value: currentMonthCases,
        change: casesChange,
        trend: casesChange >= 0 ? 'up' : 'down'
      },
      {
        title: 'Resolution Rate',
        value: `${Math.round(successRate)}%`,
        change: 5.2, // Calculate actual change if historical data available
        trend: 'up'
      },
      {
        title: 'Avg. Time to Resolve',
        value: `${Math.round(averageResolutionTime)} days`,
        change: -2.1, // Calculate actual change if historical data available
        trend: 'down'
      },
      {
        title: 'Client Satisfaction',
        value: '94%',
        change: 1.5,
        trend: 'up'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalCases,
        activeCases,
        resolvedCases,
        pendingCases,
        casesByType,
        caseTimeline: Object.values(caseTimeline),
        averageResolutionTime,
        successRate,
        monthlyTrends,
        priorityDistribution,
        caseInsights
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 