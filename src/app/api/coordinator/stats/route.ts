import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get coordinator profile with related data
    const coordinator = await prisma.coordinator.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        office: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        assignments: {
          where: {
            status: 'ACTIVE'
          }
        },
        projects: {
          where: {
            status: 'IN_PROGRESS'
          }
        }
      }
    });

    if (!coordinator) {
      return NextResponse.json(
        { error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Get cases statistics
    const [
      totalCases,
      activeCases,
      completedCases,
      recentCases,
      successfulCases
    ] = await Promise.all([
      // Total cases in coordinator's office
      prisma.case.count({
        where: {
          officeId: coordinator.officeId
        }
      }),

      // Active cases
      prisma.case.count({
        where: {
          officeId: coordinator.officeId,
          status: 'ACTIVE'
        }
      }),

      // Completed cases
      prisma.case.count({
        where: {
          officeId: coordinator.officeId,
          status: 'RESOLVED'
        }
      }),

      // Recent cases (last 30 days)
      prisma.case.findMany({
        where: {
          officeId: coordinator.officeId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),

      // Successful cases
      prisma.case.count({
        where: {
          officeId: coordinator.officeId,
          status: 'RESOLVED',
          resolvedAt: {
            not: null
          }
        }
      })
    ]);

    // Calculate success rate
    const successRate = totalCases > 0 
      ? Math.round((successfulCases / totalCases) * 100) 
      : 0;

    // Get performance metrics
    const performance = await prisma.officePerformance.findMany({
      where: {
        officeId: coordinator.officeId,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json({
      coordinator: {
        id: coordinator.id,
        office: coordinator.office,
        type: coordinator.type,
        status: coordinator.status
      },
      stats: {
        casesHandled: totalCases,
        activeCases,
        completedCases,
        successRate,
        activeProjects: coordinator.projects.length,
        activeAssignments: coordinator.assignments.length
      },
      recentCases,
      performance,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Error fetching coordinator stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coordinator statistics' },
      { status: 500 }
    );
  }
} 