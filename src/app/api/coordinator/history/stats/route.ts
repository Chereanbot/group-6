import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, subMonths, subYears } from 'date-fns';
import { headers } from 'next/headers';

export async function GET(request: Request) {
    try {
        const headersList = await headers();
        const token = headersList.get('authorization')?.split(' ')[1] || 
                     request.headers.get('cookie')?.split('; ')
                     .find(row => row.startsWith('auth-token='))
                     ?.split('=')[1];
    
        if (!token) {
          return NextResponse.json(
            { success: false, message: 'Authentication required' },
            { status: 200 }
          );
        }
    
        const { isAuthenticated, user } = await verifyAuth(token);
    
        if (!isAuthenticated || !user) {
          return NextResponse.json(
            { success: false, message: 'Invalid or expired token' },
            { status: 200 }
          );
        }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '90d':
        startDate = startOfDay(subDays(now, 90));
        break;
      case '1y':
        startDate = startOfDay(subYears(now, 1));
        break;
      default:
        startDate = startOfDay(subDays(now, 30));
    }

    // Fetch statistics
    const [
      totalActions,
      actionsByType,
      actionsByEntity,
      dailyActions,
      statusDistribution,
      topClients,
      topCases
    ] = await Promise.all([
      // Total actions in period
      prisma.coordinatorHistory.count({
        where: {
          coordinatorId: user.id,
          changedAt: {
            gte: startDate,
            lte: endOfDay(now)
          }
        }
      }),

      // Actions by type
      prisma.coordinatorHistory.groupBy({
        by: ['action'],
        where: {
            coordinatorId: user.id,
          changedAt: {
            gte: startDate,
            lte: endOfDay(now)
          }
        },
        _count: true
      }),

      // Actions by entity type
      prisma.coordinatorHistory.groupBy({
        by: ['action'],
        where: {
            coordinatorId: user.id,
          changedAt: {
            gte: startDate,
            lte: endOfDay(now)
          }
        },
        _count: {
          clientId: true,
          caseId: true,
          documentId: true,
          appointmentId: true,
          serviceRequestId: true
        }
      }),

      // Daily actions count
      prisma.coordinatorHistory.groupBy({
        by: ['changedAt'],
        where: {
          coordinatorId: user.id,
          changedAt: {
            gte: startDate,
            lte: endOfDay(now)
          }
        },
        _count: true
      }),

      // Status distribution
      prisma.coordinatorHistory.findMany({
        where: {
          coordinatorId: user.id,
          changedAt: {
            gte: startDate,
            lte: endOfDay(now)
          }
        },
        select: {
          client: { select: { status: true } },
          case: { select: { status: true } },
          serviceRequest: { select: { status: true } }
        }
      }),

      // Top clients by activity
      prisma.coordinatorHistory.groupBy({
        by: ['clientId'],
        where: {
          coordinatorId: user.id,
          changedAt: {
            gte: startDate,
            lte: endOfDay(now)
          },
          clientId: { not: null }
        },
        _count: true,
        orderBy: {
          _count: {
            clientId: 'desc'
          }
        },
        take: 5
      }),

      // Top cases by activity
      prisma.coordinatorHistory.groupBy({
        by: ['caseId'],
        where: {
          coordinatorId: user.id,
          changedAt: {
            gte: startDate,
            lte: endOfDay(now)
          },
          caseId: { not: null }
        },
        _count: true,
        orderBy: {
          _count: {
            caseId: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Process status distribution
    const statusCounts = {
      client: {} as Record<string, number>,
      case: {} as Record<string, number>,
      serviceRequest: {} as Record<string, number>
    };

    statusDistribution.forEach(entry => {
      if (entry.client?.status) {
        statusCounts.client[entry.client.status] = (statusCounts.client[entry.client.status] || 0) + 1;
      }
      if (entry.case?.status) {
        statusCounts.case[entry.case.status] = (statusCounts.case[entry.case.status] || 0) + 1;
      }
      if (entry.serviceRequest?.status) {
        statusCounts.serviceRequest[entry.serviceRequest.status] = (statusCounts.serviceRequest[entry.serviceRequest.status] || 0) + 1;
      }
    });

    // Get details for top clients and cases
    const topClientDetails = await Promise.all(
      topClients.map(async ({ clientId, _count }) => {
        const client = await prisma.Client.findUnique({
          where: { id: clientId },
          select: { fullName: true, status: true }
        });
        return {
          id: clientId,
          name: client?.fullName || 'Unknown',
          status: client?.status || 'Unknown',
          activityCount: _count
        };
      })
    );

    const topCaseDetails = await Promise.all(
      topCases.map(async ({ caseId, _count }) => {
        const case_ = await prisma.case.findUnique({
          where: { id: caseId },
          select: { title: true, status: true }
        });
        return {
          id: caseId,
          title: case_?.title || 'Unknown',
          status: case_?.status || 'Unknown',
          activityCount: _count
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalActions,
        actionsByType: actionsByType.map(({ action, _count }) => ({
          action,
          count: _count
        })),
        actionsByEntity: actionsByEntity.map(({ action, _count }) => ({
          action,
          counts: {
            clients: _count.clientId || 0,
            cases: _count.caseId || 0,
            documents: _count.documentId || 0,
            appointments: _count.appointmentId || 0,
            serviceRequests: _count.serviceRequestId || 0
          }
        })),
        dailyActions: dailyActions.map(({ changedAt, _count }) => ({
          date: changedAt.toISOString(),
          count: _count
        })),
        statusDistribution: statusCounts,
        topClients: topClientDetails,
        topCases: topCaseDetails
      }
    });

  } catch (error) {
    console.error('Error fetching history statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 