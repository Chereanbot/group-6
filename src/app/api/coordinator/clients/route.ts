import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserStatus, UserRoleEnum } from '@prisma/client';

// GET - Fetch clients with pagination and filters
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as UserStatus;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        office: true
      }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json({ success: false, error: 'Coordinator office not found' }, { status: 404 });
    }

    const where = {
      userRole: UserRoleEnum.CLIENT,
      office: {
        id: coordinator.office.id
      },
      ...(status && { status }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [total, clients] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          cases: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              createdAt: true
            }
          },
          appointments: {
            select: {
              id: true,
              title: true,
              date: true,
              status: true
            },
            where: {
              date: {
                gte: new Date()
              }
            }
          },
          documents: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        clients,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Register new client
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { fullName, email, phone, address, idNumber, emergencyContact, preferredLanguage } = data;

    // Validate required fields
    if (!fullName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        office: true
      }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json(
        { success: false, error: 'Coordinator office not found' },
        { status: 404 }
      );
    }

    // Check if phone number already exists
    const existingUser = await prisma.user.findFirst({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Create new client
    const client = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        userRole: UserRoleEnum.CLIENT,
        status: UserStatus.ACTIVE,
        password: Math.random().toString(36).slice(-8), // Generate random password
        profile: {
          create: {
            address,
            idNumber,
            emergencyContact,
            preferredLanguage,
            officeId: coordinator.office.id
          }
        }
      },
      include: {
        profile: true
      }
    });

    return NextResponse.json({
      success: true,
      data: client
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PATCH - Update client information
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        profile: updateData.profile ? {
          update: updateData.profile
        } : undefined
      },
      include: {
        profile: true,
        cases: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedClient
    });

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
} 