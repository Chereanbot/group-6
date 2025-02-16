import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

// GET - Get all staff assigned to an office
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get office with staff
    const office = await prisma.office.findUnique({
      where: { id },
      include: {
        lawyers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                userRole: true,
                status: true
              }
            },
            specializations: {
              include: {
                specialization: true
              }
            }
          }
        },
        coordinators: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                userRole: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        lawyers: office.lawyers,
        coordinators: office.coordinators
      }
    });

  } catch (error) {
    console.error('Error fetching office staff:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch office staff',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Assign staff to office
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Only admins can assign staff
    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Check if office exists
    const office = await prisma.office.findUnique({
      where: { id },
      include: {
        lawyers: true,
        coordinators: true
      }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check office capacity
    const totalStaff = office.lawyers.length + office.coordinators.length;
    if (totalStaff >= office.capacity) {
      return NextResponse.json(
        { error: 'Office has reached maximum capacity' },
        { status: 400 }
      );
    }

    let updatedOffice;

    // Assign based on role
    if (role === UserRoleEnum.LAWYER) {
      // Check if user is already assigned to another office
      const existingAssignment = await prisma.lawyerProfile.findFirst({
        where: { userId }
      });

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'Lawyer is already assigned to an office' },
          { status: 400 }
        );
      }

      // Create lawyer profile and assign to office
      updatedOffice = await prisma.office.update({
        where: { id },
        data: {
          lawyers: {
            create: {
              userId,
              status: user.status,
              availability: true
            }
          }
        },
        include: {
          lawyers: {
            include: {
              user: true
            }
          }
        }
      });

    } else if (role === UserRoleEnum.COORDINATOR) {
      // Check if user is already assigned to another office
      const existingAssignment = await prisma.coordinator.findFirst({
        where: { userId }
      });

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'Coordinator is already assigned to an office' },
          { status: 400 }
        );
      }

      // Create coordinator profile and assign to office
      updatedOffice = await prisma.office.update({
        where: { id },
        data: {
          coordinators: {
            create: {
              userId,
              status: user.status
            }
          }
        },
        include: {
          coordinators: {
            include: {
              user: true
            }
          }
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid role for office assignment' },
        { status: 400 }
      );
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: authResult.user.id,
        action: 'ASSIGN_STAFF_TO_OFFICE',
        details: {
          officeId: id,
          officeName: office.name,
          assignedUserId: userId,
          assignedUserRole: role
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedOffice
    });

  } catch (error) {
    console.error('Error assigning staff to office:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to assign staff to office',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove staff from office
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Only admins can remove staff
    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') as UserRoleEnum;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Check if office exists
    const office = await prisma.office.findUnique({
      where: { id }
    });

    if (!office) {
      return NextResponse.json(
        { error: 'Office not found' },
        { status: 404 }
      );
    }

    // Remove based on role
    if (role === UserRoleEnum.LAWYER) {
      await prisma.lawyerProfile.deleteMany({
        where: {
          userId,
          officeId: id
        }
      });
    } else if (role === UserRoleEnum.COORDINATOR) {
      await prisma.coordinator.deleteMany({
        where: {
          userId,
          officeId: id
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid role for office assignment' },
        { status: 400 }
      );
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: authResult.user.id,
        action: 'REMOVE_STAFF_FROM_OFFICE',
        details: {
          officeId: id,
          officeName: office.name,
          removedUserId: userId,
          removedUserRole: role
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member removed from office successfully'
    });

  } catch (error) {
    console.error('Error removing staff from office:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to remove staff from office',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 