import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const coordinator = await prisma.coordinator.findFirst({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
            userRole: true
          }
        },
        office: {
          select: {
            id: true,
            name: true,
            location: true,
            type: true,
            status: true,
            contactEmail: true,
            contactPhone: true,
            address: true,
            capacity: true
          }
        },
        qualifications: {
          include: {
            documents: {
              include: {
                document: true
              }
            }
          }
        },
        documents: {
          include: {
            document: true
          }
        }
      }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, error: 'Coordinator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: coordinator
    });

  } catch (error) {
    console.error('Error fetching coordinator profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const coordinator = await prisma.coordinator.findFirst({
      where: {
        userId: userId
      },
      include: {
        user: true
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
            fullName: true,
            email: true,
            phone: true,
            userRole: true
          }
        },
        office: {
          select: {
            id: true,
            name: true,
            location: true,
            type: true,
            status: true,
            contactEmail: true,
            contactPhone: true,
            address: true,
            capacity: true
          }
        },
        qualifications: {
          include: {
            documents: {
              include: {
                document: true
              }
            }
          }
        },
        documents: {
          include: {
            document: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      profile: updatedCoordinator
    });

  } catch (error) {
    console.error('Error updating coordinator profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}