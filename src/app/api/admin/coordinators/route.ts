import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, UserStatus, CoordinatorStatus, CoordinatorType } from '@prisma/client';
import bcrypt from 'bcrypt';

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

export async function GET(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.getAll('status');
    const type = searchParams.getAll('type');
    const office = searchParams.get('office');
    const specialties = searchParams.getAll('specialties');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    if (status.length > 0) {
      where.status = { in: status };
    }

    if (type.length > 0) {
      where.type = { in: type };
    }

    if (office) {
      where.officeId = office;
    }

    if (specialties.length > 0) {
      where.specialties = {
        hasSome: specialties
      };
    }

    // Get total count for pagination
    const total = await prisma.coordinator.count({ where });

    // Get paginated coordinators with related data
    const coordinators = await prisma.coordinator.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            status: true,
            userRole: true,
            createdAt: true,
            updatedAt: true
          }
        },
        office: {
          select: {
            id: true,
            name: true,
            location: true,
            capacity: true
          }
        },
        qualifications: {
          select: {
            id: true,
            type: true,
            title: true,
            institution: true,
            dateObtained: true,
            expiryDate: true,
            score: true
          }
        },
        _count: {
          select: {
            qualifications: true,
            documents: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get office statistics
    const officeStats = await prisma.office.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            coordinators: {
              where: {
                status: CoordinatorStatus.ACTIVE
              }
            }
          }
        }
      }
    });

    // Calculate coordinator statistics
    const stats = {
      total,
      active: await prisma.coordinator.count({ 
        where: { ...where, status: CoordinatorStatus.ACTIVE } 
      }),
      inactive: await prisma.coordinator.count({ 
        where: { ...where, status: CoordinatorStatus.INACTIVE } 
      }),
      suspended: await prisma.coordinator.count({ 
        where: { ...where, status: CoordinatorStatus.SUSPENDED } 
      })
    };

    return NextResponse.json({
      success: true,
      data: {
        coordinators,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats,
        offices: officeStats
      }
    });

  } catch (error) {
    console.error('Error in coordinators API:', error);
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

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['email', 'password', 'fullName', 'officeId', 'type'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check office capacity
    const office = await prisma.office.findUnique({
      where: { id: body.officeId },
      include: {
        _count: {
          select: {
            coordinators: {
              where: {
                status: CoordinatorStatus.ACTIVE
              }
            }
          }
        }
      }
    });

    if (!office) {
      return NextResponse.json(
        { success: false, error: 'Office not found' },
        { status: 404 }
      );
    }

    const maxAllowed = office.capacity || 10;
    if (office._count.coordinators >= maxAllowed) {
      return NextResponse.json(
        { success: false, error: `Office has reached maximum capacity of ${maxAllowed} coordinators` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create coordinator in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          fullName: body.fullName,
          phone: body.phone,
          userRole: UserRoleEnum.COORDINATOR,
          status: UserStatus.ACTIVE
        }
      });

      // Prepare qualifications data if provided
      const qualificationsData = Array.isArray(body.qualifications) && body.qualifications.length > 0
        ? {
            createMany: {
              data: body.qualifications.map((q: any) => ({
                type: q.type,
                title: q.title,
                institution: q.institution,
                dateObtained: new Date(q.dateObtained),
                expiryDate: q.expiryDate ? new Date(q.expiryDate) : null,
                score: q.score || null
              }))
            }
          }
        : undefined;

      // Create coordinator profile
      const coordinator = await tx.coordinator.create({
        data: {
          userId: user.id,
          officeId: body.officeId,
          type: body.type as CoordinatorType,
          startDate: body.startDate ? new Date(body.startDate) : new Date(),
          endDate: body.endDate ? new Date(body.endDate) : null,
          specialties: Array.isArray(body.specialties) ? body.specialties : [],
          status: CoordinatorStatus.ACTIVE,
          ...(qualificationsData && { qualifications: qualificationsData })
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              status: true,
              userRole: true
            }
          },
          office: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          qualifications: true
        }
      });

      // Log activity
      await tx.activity.create({
        data: {
          userId: adminCheck.authResult.user.id,
          action: 'COORDINATOR_CREATED',
          details: {
            coordinatorId: coordinator.id,
            coordinatorName: body.fullName,
            office: office.name
          }
        }
      });

      return coordinator;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Coordinator created successfully'
    });

  } catch (error: any) {
    console.error('Error creating coordinator:', error);
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A unique constraint was violated. Please check the provided data.' },
        { status: 400 }
      );
    }
    
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Invalid reference. Please check if all referenced IDs exist.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create coordinator',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coordinator ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if coordinator exists
    const existingCoordinator = await prisma.coordinator.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingCoordinator) {
      return NextResponse.json(
        { success: false, error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Update coordinator in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: existingCoordinator.userId },
        data: {
          fullName: body.fullName,
          phone: body.phone
        }
      });

      // Update coordinator
      const coordinator = await tx.coordinator.update({
        where: { id },
        data: {
          type: body.type,
          officeId: body.officeId,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : null,
          specialties: body.specialties,
          status: body.status,
          qualifications: {
            deleteMany: {},
            createMany: {
              data: body.qualifications.map((q: any) => ({
                type: q.type,
                title: q.title,
                institution: q.institution,
                dateObtained: new Date(q.dateObtained),
                expiryDate: q.expiryDate ? new Date(q.expiryDate) : null,
                score: q.score
              }))
            }
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              status: true,
              userRole: true
            }
          },
          office: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          qualifications: true
        }
      });

      // Log activity
      await tx.activity.create({
        data: {
          userId: adminCheck.authResult.user.id,
          action: 'COORDINATOR_UPDATED',
          details: {
            coordinatorId: coordinator.id,
            coordinatorName: body.fullName,
            changes: body
          }
        }
      });

      return coordinator;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Coordinator updated successfully'
    });

  } catch (error) {
    console.error('Error updating coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update coordinator' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coordinator ID is required' },
        { status: 400 }
      );
    }

    // Check if coordinator exists
    const existingCoordinator = await prisma.coordinator.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingCoordinator) {
      return NextResponse.json(
        { success: false, error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Delete coordinator in transaction
    await prisma.$transaction(async (tx) => {
      // Delete qualifications
      await tx.qualification.deleteMany({
        where: { coordinatorId: id }
      });

      // Delete coordinator
      await tx.coordinator.delete({
        where: { id }
      });

      // Update user status to INACTIVE
      await tx.user.update({
        where: { id: existingCoordinator.userId },
        data: { status: 'INACTIVE' }
      });

      // Log activity
      await tx.activity.create({
        data: {
          userId: adminCheck.authResult.user.id,
          action: 'COORDINATOR_DELETED',
          details: {
            coordinatorId: id,
            coordinatorName: existingCoordinator.user.fullName
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Coordinator deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting coordinator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coordinator' },
      { status: 500 }
    );
  }
} 