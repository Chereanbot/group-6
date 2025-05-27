import { NextResponse } from 'next/server';
  import { cookies, headers } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum, CaseStatus } from '@prisma/client';

export async function GET() {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
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

    console.log('Fetching dashboard data for coordinator:', user.id);

    // First get the coordinator profile
    const coordinator = await prisma.coordinator.findFirst({
      where: {
        userId: user.id
      }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: "Coordinator profile not found" },
        { status: 404 }
      );
    }

    // Get total cases count
    const totalCases = await prisma.case.count({
      where: {
        assignments: {
          some: {
            assignedToId: user.id,
            status: {
              not: 'COMPLETED'
            }
          }
        }
      }
    });

    // Get active cases count
    const activeCases = await prisma.case.count({
      where: {
        assignments: {
          some: {
            assignedToId: user.id,
            status: 'PENDING'
          }
        },
        status: CaseStatus.ACTIVE
      }
    });

    // Get pending documents count
    const pendingDocuments = await prisma.caseDocument.count({
      where: {
        case: {
          assignments: {
            some: {
              assignedToId: user.id,
              status: 'PENDING'
            }
          }
        }
      }
    });

    // Get upcoming appointments
    const now = new Date();
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        coordinatorId: user.id,
        scheduledTime: {
          gte: now
        }
      }
    });

    // Get recent cases
    const recentCases = await prisma.case.findMany({
      where: {
        assignments: {
          some: {
            assignedToId: user.id,
            status: 'PENDING'
          }
        }
      },
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        updatedAt: true
      }
    });

    // Get upcoming appointments details
    const appointments = await prisma.appointment.findMany({
      where: {
        coordinatorId: user.id,
        scheduledTime: {
          gte: now
        }
      },
      take: 10,
      orderBy: {
        scheduledTime: 'asc'
      },
      include: {
        client: true
      }
    });

    // Calculate response rate and client satisfaction (mock data for now)
    const responseRate = 95;
    const clientSatisfaction = 92;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalCases,
          activeCases,
          pendingDocuments,
          upcomingAppointments,
          responseRate,
          clientSatisfaction,
        },
        recentCases: recentCases.map((c) => ({
          ...c,
          updatedAt: c.updatedAt.toISOString(),
        })),
        appointments: appointments.map((a) => ({
          id: a.id,
          title: a.purpose || a.notes || 'Appointment',
          startTime: a.scheduledTime.toISOString(),
          endTime: new Date(a.scheduledTime.getTime() + (a.duration || 60) * 60000).toISOString(),
          clientName: a.client ? `${a.client.fullName}`.trim() || 'Unknown Client' : 'Unknown Client',
          type: a.caseType || a.status
        })),
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 