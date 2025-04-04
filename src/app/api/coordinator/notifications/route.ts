import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { NotificationStatus, UserRoleEnum } from '@prisma/client';
import { cookies, headers } from 'next/headers';

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify authentication and coordinator role
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    // Get unread notifications count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: authResult.user.id,
        status: 'UNREAD',
      },
    });

    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: authResult.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify authentication and coordinator role
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Mark notification as read
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: authResult.user.id,
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        readAt: notification.readAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify authentication and coordinator role
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    const { notificationId } = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Mark notification as read
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: authResult.user.id
      },
      data: {
        status: NotificationStatus.READ
      }
    });

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
        readAt: notification.readAt?.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 