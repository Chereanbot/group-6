import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { CoordinatorStatus } from '@prisma/client';

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

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    // First get the user to ensure they have a coordinator profile
    const user = await prisma.user.findUnique({
      where: {
        id: payload.id
      },
      include: {
        coordinatorProfile: {
          include: {
            office: {
              include: {
                coordinators: {
                  where: {
                    status: CoordinatorStatus.ACTIVE
                  },
                  include: {
                    user: {
                      select: {
                        fullName: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.coordinatorProfile) {
      return NextResponse.json(
        { success: false, message: 'Coordinator profile not found' },
        { status: 200 }
      );
    }

    // Get case and client statistics
    const [activeCases, totalClients, pendingAppointments] = await Promise.all([
      prisma.case.count({
        where: {
          assignedOffice: {
            id: user.coordinatorProfile.office.id
          },
          status: 'ACTIVE'
        }
      }),
      prisma.user.count({
        where: {
          userRole: 'CLIENT',
          clientCases: {
            some: {
              assignedOffice: {
                id: user.coordinatorProfile.office.id
              }
            }
          }
        }
      }),
      prisma.appointment.count({
        where: {
          coordinatorId: user.id,
          status: 'SCHEDULED'
        }
      })
    ]);

    // Get recent cases
    const recentCases = await prisma.case.findMany({
      where: {
        assignedOffice: {
          id: user.coordinatorProfile.office.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        clientName: true,
        createdAt: true
      }
    });

    const profile = {
      id: user.coordinatorProfile.id,
      type: user.coordinatorProfile.type,
      specialties: user.coordinatorProfile.specialties || [],
      startDate: user.coordinatorProfile.startDate,
      endDate: user.coordinatorProfile.endDate,
      status: user.coordinatorProfile.status,
      createdAt: user.coordinatorProfile.createdAt,
      updatedAt: user.coordinatorProfile.updatedAt,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      office: {
        id: user.coordinatorProfile.office.id,
        name: user.coordinatorProfile.office.name,
        location: user.coordinatorProfile.office.location,
        type: user.coordinatorProfile.office.type,
        status: user.coordinatorProfile.office.status,
        contactEmail: user.coordinatorProfile.office.contactEmail,
        contactPhone: user.coordinatorProfile.office.contactPhone,
        capacity: user.coordinatorProfile.office.capacity,
        totalCoordinators: user.coordinatorProfile.office.coordinators.length,
        coordinators: user.coordinatorProfile.office.coordinators.map(c => ({
          id: c.id,
          fullName: c.user.fullName,
          email: c.user.email
        }))
      },
      stats: {
        activeCases,
        totalClients,
        pendingAppointments
      },
      recentCases: recentCases.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        priority: c.priority,
        clientName: c.clientName,
        createdAt: c.createdAt
      }))
    };

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching coordinator profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch coordinator profile' },
      { status: 200 }
    );
  }
}

// Add PATCH endpoint for updating profile
export async function PATCH(request: Request) {
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

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { fullName, phone, specialties } = body;

    // Update both user and coordinator profile
    const user = await prisma.user.update({
      where: {
        id: payload.id
      },
      data: {
        fullName,
        phone,
        coordinatorProfile: {
          update: {
            specialties
          }
        }
      },
      include: {
        coordinatorProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error updating coordinator profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update coordinator profile' },
      { status: 200 }
    );
  }
} 