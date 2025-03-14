import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const action = url.searchParams.get('action');
    const search = url.searchParams.get('search');

    // Build where clause based on filters
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (action) {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { 
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        { details: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const total = await prisma.activity.count({ 
      where: {
        ...where,
        action: {
          in: [
            'USER_LOGIN_FAILED',
            'USER_LOGIN_SUCCESS',
            'USER_PASSWORD_RESET',
            'USER_2FA_ENABLED',
            'USER_BLOCKED',
            'USER_SESSION_REVOKED',
            'USER_ROLE_UPDATED',
            'USER_STATUS_UPDATED',
            'USER_PROFILE_UPDATED',
            'USER_DELETED'
          ]
        }
      }
    });

    // Get paginated results
    const logs = await prisma.activity.findMany({
      where: {
        ...where,
        action: {
          in: [
            'USER_LOGIN_FAILED',
            'USER_LOGIN_SUCCESS',
            'USER_PASSWORD_RESET',
            'USER_2FA_ENABLED',
            'USER_BLOCKED',
            'USER_SESSION_REVOKED',
            'USER_ROLE_UPDATED',
            'USER_STATUS_UPDATED',
            'USER_PROFILE_UPDATED',
            'USER_DELETED'
          ]
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            userRole: true,
            status: true
          }
        }
      }
    });

    // Format logs for response
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.createdAt,
      user: {
        id: log.user.id,
        email: log.user.email,
        name: log.user.fullName,
        role: log.user.userRole,
        status: log.user.status
      }
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security logs' },
      { status: 500 }
    );
  }
} 