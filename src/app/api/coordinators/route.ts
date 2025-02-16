import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CoordinatorStatus, CoordinatorType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get('auth-token')?.value;
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.fullName || !body.officeId) {
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
      status = CoordinatorStatus.ACTIVE
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
                status: 'ACTIVE'
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
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          userRole: 'COORDINATOR',
          status: 'ACTIVE',
          phone
        }
      });

      // Create coordinator profile
      const coordinator = await prisma.coordinator.create({
        data: {
          userId: user.id,
          officeId,
          type,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          specialties,
          status
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true,
              status: true
            }
          },
          office: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      });

      return coordinator;
    });

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

export async function GET(request: Request) {
  try {
    const coordinators = await prisma.coordinator.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            status: true
          }
        },
        office: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        qualifications: {
          select: {
            id: true,
            type: true,
            title: true,
            institution: true,
            dateObtained: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: coordinators
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