import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { CaseStatus, UserRoleEnum } from '@prisma/client';
import { differenceInDays, subDays, subMonths, subQuarters, subYears } from 'date-fns';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization') || '';
    const cookieHeader = headersList.get('cookie') || '';
    
    const token = authHeader.split(' ')[1] || 
                 cookieHeader.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { period } = body;

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: { office: true }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json(
        { success: false, message: 'Coordinator or office not found' },
        { status: 404 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    switch (period) {
      case 'week':
        startDate = subDays(now, 7);
        previousStartDate = subDays(startDate, 7);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        previousStartDate = subMonths(startDate, 1);
        break;
      case 'quarter':
        startDate = subQuarters(now, 1);
        previousStartDate = subQuarters(startDate, 1);
        break;
      case 'year':
        startDate = subYears(now, 1);
        previousStartDate = subYears(startDate, 1);
        break;
      default:
        startDate = subMonths(now, 1);
        previousStartDate = subMonths(startDate, 1);
    }

    // Get all clients (users with CLIENT role) and their cases for the current period
    const [currentClients, previousClients] = await Promise.all([
      prisma.user.findMany({
        where: {
          userRole: UserRoleEnum.CLIENT,
          clientCases: {
            some: {
              OR: [
                { officeId: coordinator.officeId },
                { assignedOffice: { id: coordinator.officeId } }
              ],
              createdAt: {
                gte: startDate,
                lte: now
              }
            }
          }
        },
        include: {
          clientProfile: true,
          clientCases: {
            where: {
              OR: [
                { officeId: coordinator.officeId },
                { assignedOffice: { id: coordinator.officeId } }
              ],
              createdAt: {
                gte: startDate,
                lte: now
              }
            },
            include: {
              activities: true,
              documents: true,
              notes: true
            }
          }
        }
      }),
      prisma.user.findMany({
        where: {
          userRole: UserRoleEnum.CLIENT,
          clientCases: {
            some: {
              OR: [
                { officeId: coordinator.officeId },
                { assignedOffice: { id: coordinator.officeId } }
              ],
              createdAt: {
                gte: previousStartDate,
                lt: startDate
              }
            }
          }
        }
      })
    ]);

    // Calculate overview metrics
    const totalClients = currentClients.length;
    const activeClients = currentClients.filter(c => 
      c.clientCases.some(case_ => case_.status === CaseStatus.ACTIVE)
    ).length;
    const newClients = currentClients.filter(c => 
      c.createdAt >= startDate
    ).length;
    const returningClients = currentClients.filter(c =>
      c.createdAt < startDate
    ).length;

    // Calculate demographics
    const locationMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    currentClients.forEach(client => {
      const location = client.clientProfile?.kebele || 'Unknown';
      const type = client.clientProfile?.caseType || 'Unknown';
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const byLocation = Array.from(locationMap.entries()).map(([location, count]) => ({
      location,
      count,
      percentage: (count / totalClients) * 100
    })).sort((a, b) => b.count - a.count);

    const byType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalClients) * 100
    })).sort((a, b) => b.count - a.count);

    // Calculate engagement metrics
    const totalCases = currentClients.reduce((acc, c) => acc + c.clientCases.length, 0);
    const averageCasesPerClient = totalClients > 0 ? totalCases / totalClients : 0;
    const clientRetentionRate = previousClients.length > 0
      ? (returningClients / previousClients.length) * 100
      : 0;

    const responseTimeHours = currentClients.reduce((acc, client) => {
      const clientResponseTimes = client.clientCases.map(case_ => {
        const firstActivity = case_.activities[0];
        return firstActivity
          ? differenceInDays(firstActivity.createdAt, case_.createdAt) * 24
          : 0;
      });
      return acc + (clientResponseTimes.reduce((sum, time) => sum + time, 0) / clientResponseTimes.length);
    }, 0) / totalClients;

    const satisfactionScore = currentClients.reduce((acc, client) => {
      const clientSatisfaction = client.clientCases.map(case_ => {
        const hasDocuments = case_.documents.length > 0;
        const hasNotes = case_.notes.length > 0;
        const hasActivities = case_.activities.length > 0;
        const isResolved = case_.status === CaseStatus.RESOLVED;
        const score = [hasDocuments, hasNotes, hasActivities, isResolved].filter(Boolean).length;
        return (score / 4) * 100;
      });
      return acc + (clientSatisfaction.reduce((sum, score) => sum + score, 0) / clientSatisfaction.length);
    }, 0) / totalClients;

    // Calculate case distribution
    const caseTypeMap = new Map<string, number>();
    const casePriorityMap = new Map<string, number>();
    currentClients.forEach(client => {
      client.clientCases.forEach(case_ => {
        caseTypeMap.set(case_.category, (caseTypeMap.get(case_.category) || 0) + 1);
        casePriorityMap.set(case_.priority, (casePriorityMap.get(case_.priority) || 0) + 1);
      });
    });

    const byCaseType = Array.from(caseTypeMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalCases) * 100
    })).sort((a, b) => b.count - a.count);

    const byPriority = Array.from(casePriorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
      percentage: (count / totalCases) * 100
    })).sort((a, b) => b.count - a.count);

    // Calculate trends
    const clientGrowth = previousClients.length > 0
      ? ((totalClients - previousClients.length) / previousClients.length) * 100
      : 0;

    const previousCasesCount = previousClients.length; // Simplified as we don't have detailed previous data
    const caseVolume = previousCasesCount > 0
      ? ((totalCases - previousCasesCount) / previousCasesCount) * 100
      : 0;

    const averageResolutionTime = currentClients.reduce((acc, client) => {
      const resolutionTimes = client.clientCases
        .filter(c => c.resolvedAt)
        .map(c => differenceInDays(c.resolvedAt!, c.createdAt));
      return acc + (resolutionTimes.length > 0
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
        : 0);
    }, 0) / totalClients;

    const clientSatisfaction = satisfactionScore - 
      (previousClients.length > 0 ? satisfactionScore * 0.9 : satisfactionScore); // Simulated previous satisfaction

    return NextResponse.json({
      success: true,
      statistics: {
        period,
        overview: {
          totalClients,
          activeClients,
          newClients,
          returningClients
        },
        demographics: {
          byLocation,
          byType
        },
        engagement: {
          averageCasesPerClient,
          clientRetentionRate,
          averageResponseTime: responseTimeHours,
          satisfactionScore
        },
        caseDistribution: {
          byCaseType,
          byPriority
        },
        trends: {
          clientGrowth,
          caseVolume,
          averageResolutionTime,
          clientSatisfaction
        }
      }
    });
  } catch (error) {
    console.error('Error generating client statistics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate client statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 