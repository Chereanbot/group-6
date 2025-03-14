import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UserRoleEnum, UserStatus } from '@prisma/client';

// Define security event types
const SECURITY_EVENTS = {
  LOGIN_FAILED: 'USER_LOGIN_FAILED',
  LOGIN_SUCCESS: 'USER_LOGIN_SUCCESS',
  PASSWORD_RESET: 'USER_PASSWORD_RESET',
  ENABLE_2FA: 'USER_2FA_ENABLED',
  USER_BLOCKED: 'USER_BLOCKED',
  SESSION_REVOKED: 'USER_SESSION_REVOKED',
  ROLE_UPDATED: 'USER_ROLE_UPDATED',
  STATUS_UPDATED: 'USER_STATUS_UPDATED',
  PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  USER_DELETED: 'USER_DELETED'
} as const;

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
    const [
      activeSessions,
      bannedAccounts,
      securityEvents
    ] = await prisma.$transaction([
      // Active sessions
      prisma.session.count({
        where: {
          active: true,
          expiresAt: { gte: new Date() }
        }
      }),
      // Banned accounts
      prisma.user.count({
        where: {
          status: UserStatus.BANNED,
          updatedAt: { gte: since }
        }
      }),
      // Security events
      prisma.activity.findMany({
        where: {
          createdAt: { gte: since },
          action: {
            in: Object.values(SECURITY_EVENTS)
          }
        },
        select: {
          id: true,
          action: true,
          details: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              userRole: true,
              fullName: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Calculate metrics from security events
    const eventCounts = {
      failedLogins: 0,
      successfulLogins: 0,
      passwordResets: 0,
      twoFactorEnrollments: 0,
      sessionRevocations: 0,
      userBlocks: 0,
      roleUpdates: 0,
      statusUpdates: 0,
      profileUpdates: 0,
      userDeletions: 0
    };

    securityEvents.forEach(event => {
      switch (event.action) {
        case SECURITY_EVENTS.LOGIN_FAILED:
          eventCounts.failedLogins++;
          break;
        case SECURITY_EVENTS.LOGIN_SUCCESS:
          eventCounts.successfulLogins++;
          break;
        case SECURITY_EVENTS.PASSWORD_RESET:
          eventCounts.passwordResets++;
          break;
        case SECURITY_EVENTS.ENABLE_2FA:
          eventCounts.twoFactorEnrollments++;
          break;
        case SECURITY_EVENTS.USER_BLOCKED:
          eventCounts.userBlocks++;
          break;
        case SECURITY_EVENTS.SESSION_REVOKED:
          eventCounts.sessionRevocations++;
          break;
        case SECURITY_EVENTS.ROLE_UPDATED:
          eventCounts.roleUpdates++;
          break;
        case SECURITY_EVENTS.STATUS_UPDATED:
          eventCounts.statusUpdates++;
          break;
        case SECURITY_EVENTS.PROFILE_UPDATED:
          eventCounts.profileUpdates++;
          break;
        case SECURITY_EVENTS.USER_DELETED:
          eventCounts.userDeletions++;
          break;
      }
    });

    // Format recent events for display
    const recentEvents = securityEvents.slice(0, 10).map(event => ({
      id: event.id,
      action: event.action,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.createdAt,
      user: {
        id: event.user.id,
        email: event.user.email,
        role: event.user.userRole,
        name: event.user.fullName,
        status: event.user.status
      }
    }));

    // Calculate additional metrics
    const totalEvents = Object.values(eventCounts).reduce((sum, count) => sum + count, 0);
    const loginAttempts = eventCounts.failedLogins + eventCounts.successfulLogins;

    return NextResponse.json({
      metrics: {
        ...eventCounts,
        activeSessions,
        bannedAccounts,
        totalEvents,
        loginSuccessRate: loginAttempts > 0 
          ? ((eventCounts.successfulLogins / loginAttempts) * 100).toFixed(2)
          : 0,
        failureRate: loginAttempts > 0
          ? ((eventCounts.failedLogins / loginAttempts) * 100).toFixed(2)
          : 0
      },
      recentEvents,
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