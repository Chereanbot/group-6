import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch admin and super admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        userRole: {
          in: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN]
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        userRole: true
      }
    });

    return NextResponse.json({
      success: true,
      users: adminUsers
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch admin users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 