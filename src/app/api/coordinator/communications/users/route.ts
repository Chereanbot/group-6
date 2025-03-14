import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET(request: Request) {
  try {
    // Get user ID from session or token
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      const token = request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

      if (token) {
        const authResult = await verifyAuth(token);
        if (authResult.isAuthenticated && authResult.user) {
          userId = authResult.user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { userRole: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all superadmins and admins
    const admins = await prisma.user.findMany({
      where: {
        userRole: {
          in: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN]
        },
        id: { not: userId } // Exclude current user
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userRole: true,
        isOnline: true,
        lastSeen: true,
        status: true
      }
    });

    // Get all lawyers
    const lawyers = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.LAWYER,
        id: { not: userId }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userRole: true,
        isOnline: true,
        lastSeen: true,
        status: true
      }
    });

    // Get all coordinators
    const coordinators = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.COORDINATOR,
        id: { not: userId }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userRole: true,
        isOnline: true,
        lastSeen: true,
        status: true
      }
    });

    // Get all clients with their profiles
    const clients = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.CLIENT,
        id: { not: userId }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        userRole: true,
        isOnline: true,
        lastSeen: true,
        status: true,
        clientProfile: {
          select: {
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      admins,
      lawyers,
      coordinators,
      clients
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 