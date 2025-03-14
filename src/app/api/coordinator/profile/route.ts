import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { UserRoleEnum } from '@prisma/client';

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

    // Verify JWT token
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      email: string;
      role: string;
      coordinatorId?: string;
    };

    // Find user and check role
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        userRole: true,
        status: true,
        coordinatorProfile: {
          include: {
            office: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 200 }
      );
    }

    if (user.userRole !== 'COORDINATOR') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Not a coordinator' },
        { status: 200 }
      );
    }

    if (!user.coordinatorProfile) {
      return NextResponse.json(
        { success: false, message: 'Coordinator profile not found' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.coordinatorProfile.id,
        type: user.coordinatorProfile.type,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          userRole: user.userRole
        },
        office: user.coordinatorProfile.office,
        specialties: user.coordinatorProfile.specialties || []
      }
    });

  } catch (error) {
    console.error('Error fetching coordinator profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 200 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const coordinator = await prisma.coordinator.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true,
        office: true
      }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Update user information
    await prisma.user.update({
      where: { id: coordinator.user.id },
      data: {
        fullName: data.fullName,
        phone: data.phone
      }
    });

    // Update coordinator information
    const updatedCoordinator = await prisma.coordinator.update({
      where: { id: coordinator.id },
      data: {
        specialties: data.specialties
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        office: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCoordinator
    });

  } catch (error) {
    console.error('Error updating coordinator profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}