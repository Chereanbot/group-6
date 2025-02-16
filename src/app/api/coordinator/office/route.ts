import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { CoordinatorType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find coordinator with their office and user details
    const coordinator = await prisma.coordinator.findFirst({
      where: {
        userId: authResult.user.id,
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
            }
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
      const userEmail = authResult.user.email.toLowerCase();
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
          }
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
          userId: authResult.user.id,
          type: CoordinatorType.PERMANENT,
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
              }
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

      return NextResponse.json({
        success: true,
        office: newCoordinator.office,
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

    return NextResponse.json({
      success: true,
      office: coordinator.office,
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