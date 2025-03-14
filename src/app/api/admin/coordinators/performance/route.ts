import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import { CoordinatorAssignment } from '@/types/coordinator';

interface WeeklyPerformance {
  period: string;
  completionRate: number;
  responseTime: number;
  clientSatisfaction: number;
  totalAssignments: number;
}

interface CoordinatorPerformance {
  coordinatorId: string;
  name: string;
  completionRate: number;
  responseTime: number;
  clientSatisfaction: number;
  totalAssignments: number;
}

interface TeamPerformance {
  averages: {
    completionRate: number;
    responseTime: number;
    clientSatisfaction: number;
  };
  topPerformers: Array<{
    coordinatorId: string;
    name: string;
    metric: 'completionRate' | 'responseTime' | 'clientSatisfaction';
    value: number;
  }>;
}

// Helper function to verify admin authorization
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
    return { error: 'Unauthorized access', status: 403 };
  }

  return { authResult };
}

// Helper function to calculate date range
function getDateRange(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'last-week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'last-month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'last-quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'last-year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  return { startDate, endDate: now };
}

// Helper function to calculate performance metrics
function calculatePerformanceMetrics(assignments: CoordinatorAssignment[]): {
  performanceData: WeeklyPerformance[];
  teamPerformance: TeamPerformance;
} {
  // Calculate weekly performance
  const weeklyData = assignments.reduce<Record<string, WeeklyPerformance>>((acc, assignment) => {
    const weekStart = new Date(assignment.createdAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!acc[weekKey]) {
      acc[weekKey] = {
        period: weekKey,
        completionRate: 0,
        responseTime: 0,
        clientSatisfaction: 0,
        totalAssignments: 0
      };
    }

    acc[weekKey].totalAssignments++;
    if (assignment.status === 'COMPLETED') {
      acc[weekKey].completionRate++;
    }
    acc[weekKey].responseTime += assignment.responseTime || 0;
    acc[weekKey].clientSatisfaction += assignment.clientRating || 0;

    return acc;
  }, {});

  // Calculate averages for each week
  Object.values(weeklyData).forEach(week => {
    week.completionRate = (week.completionRate / week.totalAssignments) * 100;
    week.responseTime = week.responseTime / week.totalAssignments;
    week.clientSatisfaction = week.clientSatisfaction / week.totalAssignments;
  });

  // Calculate coordinator performance
  const coordinatorData = assignments.reduce<Record<string, CoordinatorPerformance>>((acc, assignment) => {
    const coordId = assignment.coordinatorId;
    if (!acc[coordId]) {
      acc[coordId] = {
        coordinatorId: coordId,
        name: assignment.coordinator?.user?.fullName || 'Unknown',
        completionRate: 0,
        responseTime: 0,
        clientSatisfaction: 0,
        totalAssignments: 0
      };
    }

    acc[coordId].totalAssignments++;
    if (assignment.status === 'COMPLETED') {
      acc[coordId].completionRate++;
    }
    acc[coordId].responseTime += assignment.responseTime || 0;
    acc[coordId].clientSatisfaction += assignment.clientRating || 0;

    return acc;
  }, {});

  // Calculate averages for each coordinator
  Object.values(coordinatorData).forEach(coord => {
    coord.completionRate = (coord.completionRate / coord.totalAssignments) * 100;
    coord.responseTime = coord.responseTime / coord.totalAssignments;
    coord.clientSatisfaction = coord.clientSatisfaction / coord.totalAssignments;
  });

  // Calculate team averages
  const teamAverages = {
    completionRate: 0,
    responseTime: 0,
    clientSatisfaction: 0
  };

  const coordinators = Object.values(coordinatorData);
  if (coordinators.length > 0) {
    coordinators.forEach(coord => {
      teamAverages.completionRate += coord.completionRate;
      teamAverages.responseTime += coord.responseTime;
      teamAverages.clientSatisfaction += coord.clientSatisfaction;
    });

    teamAverages.completionRate /= coordinators.length;
    teamAverages.responseTime /= coordinators.length;
    teamAverages.clientSatisfaction /= coordinators.length;
  }

  // Get top performers for each metric
  const metrics = ['completionRate', 'responseTime', 'clientSatisfaction'] as const;
  const topPerformers = metrics.flatMap(metric => 
    coordinators
      .map(coord => ({
        coordinatorId: coord.coordinatorId,
        name: coord.name,
        metric,
        value: coord[metric]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
  );

  return {
    performanceData: Object.values(weeklyData),
    teamPerformance: {
      averages: teamAverages,
      topPerformers
    }
  };
}

export async function GET(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'last-month';
    const coordinatorId = searchParams.get('coordinatorId');

    const { startDate, endDate } = getDateRange(period);

    // Build where clause for assignments
    const where: any = {
      createdAt: { gte: startDate, lte: endDate }
    };

    if (coordinatorId) {
      where.coordinatorId = coordinatorId;
    }

    // Get assignments with coordinator data
    const assignments = await prisma.coordinatorAssignment.findMany({
      where,
      include: {
        coordinator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    const { performanceData, teamPerformance } = calculatePerformanceMetrics(assignments as unknown as CoordinatorAssignment[]);

    return NextResponse.json({
      success: true,
      data: {
        performanceData,
        teamPerformance
      }
    });

  } catch (error) {
    console.error('Error in performance API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { period = 'last-month', coordinatorId } = await request.json();

    // Get performance data
    const performanceUrl = new URL(request.url);
    performanceUrl.searchParams.set('period', period);
    if (coordinatorId) {
      performanceUrl.searchParams.set('coordinatorId', coordinatorId);
    }

    const performanceResponse = await GET(new Request(performanceUrl));
    const performanceData = await performanceResponse.json();

    if (!performanceData.success) {
      throw new Error(performanceData.error);
    }

    return NextResponse.json({
      success: true,
      data: performanceData.data
    });

  } catch (error) {
    console.error('Error generating performance report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate performance report' },
      { status: 500 }
    );
  }
} 