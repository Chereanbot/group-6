import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No session found' },
        { status: 403 }
      );
    }

    // Find user and check role
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email,
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
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Not a coordinator' },
        { status: 403 }
      );
    }

    if (!user.coordinatorProfile) {
      return NextResponse.json(
        { success: false, error: 'Coordinator profile not found' },
        { status: 404 }
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
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