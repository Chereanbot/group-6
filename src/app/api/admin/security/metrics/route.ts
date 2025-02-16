import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { SecurityService } from '@/services/security.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '24h';

    // Get timestamp for timeframe
    const getTimeframeDate = () => {
      const now = new Date();
      switch (timeframe) {
        case '24h':
          return new Date(now.setHours(now.getHours() - 24));
        case '7d':
          return new Date(now.setDate(now.getDate() - 7));
        case '30d':
          return new Date(now.setDate(now.getDate() - 30));
        default:
          return new Date(now.setHours(now.getHours() - 24));
      }
    };

    const since = getTimeframeDate();

    // Get security metrics
    const metrics = await prisma.$transaction([
      // Failed login attempts
      prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          timestamp: { gte: since }
        }
      }),
      // Successful logins
      prisma.auditLog.count({
        where: {
          action: 'LOGIN_SUCCESS',
          timestamp: { gte: since }
        }
      }),
      // Password resets
      prisma.auditLog.count({
        where: {
          action: 'PASSWORD_RESET',
          timestamp: { gte: since }
        }
      }),
      // 2FA enrollments
      prisma.auditLog.count({
        where: {
          action: 'ENABLE_2FA',
          timestamp: { gte: since }
        }
      })
    ]);

    return NextResponse.json({
      failedLogins: metrics[0],
      successfulLogins: metrics[1],
      passwordResets: metrics[2],
      twoFactorEnrollments: metrics[3],
      timeframe
    });
  } catch (error) {
    console.error('Security metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security metrics' },
      { status: 500 }
    );
  }
} 