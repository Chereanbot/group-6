import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UserRoleEnum } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get active sessions limited to 4
    const activeSessions = await prisma.session.findMany({
      where: {
        active: true,
        expiresAt: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        userId: true,
        userAgent: true,
        lastIpAddress: true,
        location: true,
        expiresAt: true,
        createdAt: true,
        active: true,
        user: {
          select: {
            id: true,
            email: true,
            userRole: true,
            status: true,
            fullName: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { expiresAt: 'desc' }
      ],
      take: 4
    });

    // Get total active sessions count
    const totalActiveSessions = await prisma.session.count({
      where: {
        active: true,
        expiresAt: {
          gte: new Date()
        }
      }
    });

    return NextResponse.json({
      sessions: activeSessions.map(session => ({
        id: session.id,
        userId: session.userId,
        userAgent: session.userAgent,
        lastIpAddress: session.lastIpAddress,
        location: session.location,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        active: session.active,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.userRole,
          status: session.user.status,
          name: session.user.fullName
        }
      })),
      total: totalActiveSessions
    });
  } catch (error) {
    console.error('Security sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Instead of deleting, mark as inactive
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        active: false,
        expiresAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

// New endpoint to revoke all sessions for a user
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Revoke all active sessions for the user
    await prisma.session.updateMany({
      where: {
        userId,
        active: true,
        expiresAt: {
          gte: new Date()
        }
      },
      data: {
        active: false,
        expiresAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
} 