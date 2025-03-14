import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Get a single user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.userId
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        username: true,
        userRole: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        lastSeen: true,
        isOnline: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        coordinatorProfile: {
          select: {
            id: true,
            type: true,
            status: true,
            office: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      phone,
      fullName,
      username,
      userRole,
      status,
      roleId
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.userId
      }
    });

    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check for duplicate email/phone/username if they're being updated
    if (email || phone || username) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          id: { not: params.userId },
          OR: [
            { email: email || existingUser.email },
            { phone: phone || existingUser.phone },
            { username: username || existingUser.username }
          ]
        }
      });

      if (duplicateUser) {
        return new NextResponse('User with this email/phone/username already exists', { status: 400 });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: params.userId
      },
      data: {
        email,
        phone,
        fullName,
        username,
        userRole,
        status,
        roleId
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        username: true,
        userRole: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.userId
      }
    });

    if (!existingUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Delete user
    await prisma.user.delete({
      where: {
        id: params.userId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 