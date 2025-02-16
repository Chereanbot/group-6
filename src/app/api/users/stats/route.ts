import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const token = authHeader?.split(' ')[1];

    // Verify authentication
    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized access. Please log in again.' }, 
        { status: 401 }
      );
    }

    // Verify admin role
    if (authResult.user?.userRole !== UserRoleEnum.ADMIN && authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get user stats
    const [
      total,
      active,
      pending,
      blocked,
      newToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.BANNED } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    return NextResponse.json({
      overview: {
        total,
        active,
        pending,
        blocked,
        newToday
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
} 