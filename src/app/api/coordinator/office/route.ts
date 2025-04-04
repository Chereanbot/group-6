import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { CoordinatorType, UserRoleEnum } from '@prisma/client';
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

    const { isAuthenticated,  user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    // Find coordinator with their office and user details
    const coordinator = await prisma.coordinator.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        office: {
          include: {
            coordinators: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            },
            lawyers: {
              include: {
                user: true
              }
            },
            cases: true,
            clients: true,
            resources: true
          }
        },
        user: {
          select: {
            email: true,
            fullName: true,
            userRole: true,
            phone: true
          }
        }
      }
    });

    if (!coordinator) {
      // Determine office based on email domain
      const userEmail = user.email.toLowerCase();
      let officeName;

      if (userEmail.includes('yirga')) {
        officeName = 'YIRGA_CHAFE';
      } else if (userEmail.includes('bule')) {
        officeName = 'BULE';
      } else if (userEmail.includes('cheletu')) {
        officeName = 'CHELETU';
      } else if (userEmail.includes('dilla')) {
        officeName = 'DILLA';
      } else if (userEmail.includes('yemen')) {
        officeName = 'YEMEN';
      } else if (userEmail.includes('onago')) {
        officeName = 'ONAGO';
      } else if (userEmail.includes('cherean')) {
        officeName = 'CHEREAN';
      }

      if (!officeName) {
        return NextResponse.json({ 
          success: false,
          error: 'Could not determine office from email domain' 
        }, { status: 400 });
      }

      // Find the appropriate office
      const office = await prisma.office.findFirst({
        where: { name: officeName },
        include: {
          coordinators: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          lawyers: {
            include: {
              user: true
            }
          },
          cases: true,
          clients: true,
          resources: true
        }
      });

      if (!office) {
        return NextResponse.json({ 
          success: false,
          error: `Office ${officeName} not found` 
        }, { status: 404 });
      }

      // Create coordinator profile
      const newCoordinator = await prisma.coordinator.create({
        data: {
          userId: user.id,
          type: CoordinatorType.FULL_TIME,
          status: 'ACTIVE',
          officeId: office.id,
          specialties: ['Document Processing', 'Legal Support']
        },
        include: {
          office: {
            include: {
              coordinators: {
                include: {
                  user: {
                    select: {
                      fullName: true,
                      email: true,
                      phone: true
                    }
                  }
                }
              },
              lawyers: {
                include: {
                  user: true
                }
              },
              cases: true,
              clients: true,
              resources: true
            }
          },
          user: {
            select: {
              email: true,
              fullName: true,
              userRole: true,
              phone: true
            }
          }
        }
      });

      // Calculate office statistics
      const statistics = {
        totalCases: newCoordinator.office.cases.length,
        activeCases: newCoordinator.office.cases.filter(c => c.status === 'ACTIVE').length,
        totalLawyers: newCoordinator.office.lawyers.length,
        totalClients: newCoordinator.office.clients.length,
        totalResources: newCoordinator.office.resources.length
      };

      return NextResponse.json({
        success: true,
        office: {
          ...newCoordinator.office,
          statistics
        },
        coordinator: {
          id: newCoordinator.id,
          type: newCoordinator.type,
          specialties: newCoordinator.specialties,
          user: newCoordinator.user
        }
      });
    }

    if (!coordinator.office) {
      return NextResponse.json({ 
        success: false,
        error: 'No office assigned' 
      }, { status: 404 });
    }

    // Calculate office statistics for existing coordinator
    const statistics = {
      totalCases: coordinator.office.cases.length,
      activeCases: coordinator.office.cases.filter(c => c.status === 'ACTIVE').length,
      totalLawyers: coordinator.office.lawyers.length,
      totalClients: coordinator.office.clients.length,
      totalResources: coordinator.office.resources.length
    };

    return NextResponse.json({
      success: true,
      office: {
        ...coordinator.office,
        statistics
      },
      coordinator: {
        id: coordinator.id,
        type: coordinator.type,
        specialties: coordinator.specialties,
        user: coordinator.user
      }
    });

  } catch (error) {
    console.error('Coordinator office fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch office details'
    }, { status: 500 });
  }
} 