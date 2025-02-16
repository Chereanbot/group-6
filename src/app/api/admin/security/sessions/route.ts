import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get active sessions from the last 24 hours
    const activeSessions = await prisma.session.findMany({
      where: {
        expires: {
          gte: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userRole: true,
            lastLogin: true,
            twoFactorEnabled: true
          }
        }
      },
      orderBy: {
        expires: 'desc'
      }
    });

    return NextResponse.json({
      sessions: activeSessions.map(session => ({
        id: session.id,
        userId: session.userId,
        userEmail: session.user.email,
        userRole: session.user.userRole,
        lastLogin: session.user.lastLogin,
        expires: session.expires,
        twoFactorEnabled: session.user.twoFactorEnabled
      }))
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
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
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

    await prisma.session.delete({
      where: { id: sessionId }
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