import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CoordinatorStatus, CoordinatorType, UserRoleEnum } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Verify admin authorization
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status')?.split(',') as CoordinatorStatus[] || [];
    const type = searchParams.get('type')?.split(',') as CoordinatorType[] || [];
    const office = searchParams.get('office') || '';
    const specialties = searchParams.get('specialties')?.split(',') || [];
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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

    // Get total count
    const total = await prisma.coordinator.count({ where });

    // Get paginated results
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
        stats: {
          total,
          active: coordinators.filter(c => c.status === CoordinatorStatus.ACTIVE).length,
          inactive: coordinators.filter(c => c.status === CoordinatorStatus.INACTIVE).length,
          suspended: coordinators.filter(c => c.status === CoordinatorStatus.SUSPENDED).length
        },
        offices: officeStats
      }
    });

  } catch (error) {
    console.error('Error fetching coordinators:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch coordinators'
      },
      { status: 500 }
    );
  }
}

async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      console.log('No auth token found');
      return { error: 'Unauthorized - Please log in', status: 401 };
    }

    const authResult = await verifyAuth(token);
    console.log('Auth result:', {
      isAuthenticated: authResult.isAuthenticated,
      userRole: authResult.user?.userRole,
      userId: authResult.user?.id
    });

    if (!authResult.isAuthenticated) {
      console.log('User not authenticated');
      return { error: 'Unauthorized - Please log in', status: 401 };
    }

    // Check if user is a SUPER_ADMIN
    if (authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      console.log('User is not a super admin:', {
        userRole: authResult.user?.userRole,
        expectedRole: UserRoleEnum.SUPER_ADMIN
      });
      return { error: 'Unauthorized - Super Admin access required', status: 403 };
    }

    return { authResult };
  } catch (error) {
    console.error('Error verifying admin:', error);
    return { error: 'Authentication error', status: 500 };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Coordinator Creation Request ===');
    
    // Verify admin authorization
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      console.log('Admin verification failed:', adminCheck.error);
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    console.log('Request body:', {
      email: body.email,
      fullName: body.fullName,
      officeId: body.officeId,
      type: body.type,
      hasPassword: !!body.password,
      specialties: body.specialties
    });
    
    // Validate required fields
    if (!body.email || !body.password || !body.fullName || !body.officeId) {
      console.log('Missing required fields:', { 
        email: !!body.email, 
        password: !!body.password, 
        fullName: !!body.fullName, 
        officeId: !!body.officeId 
      });
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    const { 
      email, 
      password, 
      fullName, 
      officeId,
      phone,
      type = CoordinatorType.FULL_TIME,
      startDate,
      endDate,
      specialties = [],
      status = CoordinatorStatus.ACTIVE,
      qualifications = []
    } = body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email already exists' 
        },
        { status: 400 }
      );
    }

    // Check office capacity
    const office = await prisma.office.findUnique({
      where: { id: officeId },
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
        {
          success: false,
          error: 'Office not found'
        },
        { status: 404 }
      );
    }

    const maxAllowed = office.capacity || 10; // Default to 10 if not set
    const currentCount = office._count.coordinators;

    if (currentCount >= maxAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Office has reached maximum capacity of ${maxAllowed} coordinators`
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and coordinator in a transaction
    console.log('Starting database transaction...');
    const result = await prisma.$transaction(async (prisma) => {
      console.log('Creating user...');
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          userRole: UserRoleEnum.COORDINATOR,
          status: 'ACTIVE',
          phone
        }
      });
      console.log('User created:', { id: user.id, email: user.email });

      console.log('Creating coordinator profile...');
      // Create coordinator profile
      const coordinator = await prisma.coordinator.create({
        data: {
          userId: user.id,
          officeId,
          type,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          specialties,
          status,
          qualifications: {
            createMany: {
              data: qualifications.map((q: any) => ({
                ...q,
                dateObtained: new Date(q.dateObtained),
                expiryDate: q.expiryDate ? new Date(q.expiryDate) : null
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
              location: true,
              capacity: true
            }
          },
          qualifications: true
        }
      });
      console.log('Coordinator created:', { id: coordinator.id });

      // Create activity log
      console.log('Creating activity log...');
      await prisma.activity.create({
        data: {
          userId: adminCheck.authResult.user.id,
          action: 'COORDINATOR_CREATED',
          details: {
            coordinatorId: coordinator.id,
            coordinatorName: fullName,
            office: office.name
          }
        }
      });
      console.log('Activity log created');

      return coordinator;
    });
    console.log('Transaction completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Coordinator created successfully',
      data: result
    });

  } catch (error) {
    console.error('Error creating coordinator:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create coordinator'
      },
      { status: 500 }
    );
  }
} 