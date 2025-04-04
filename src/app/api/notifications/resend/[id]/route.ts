import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get the original notification
    const originalNotification = await prisma.notification.findUnique({
      where: {
        id: params.id
      }
    });

    if (!originalNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Create a new notification with the same content
    const newNotification = await prisma.notification.create({
      data: {
        userId: originalNotification.userId,
        title: originalNotification.title,
        message: originalNotification.message,
        type: originalNotification.type,
        priority: originalNotification.priority,
        status: 'UNREAD',
        metadata: originalNotification.metadata,
        link: originalNotification.link
      }
    });

    return NextResponse.json({
      success: true,
      notification: {
        ...newNotification,
        createdAt: newNotification.createdAt.toISOString(),
        updatedAt: newNotification.updatedAt.toISOString(),
        readAt: newNotification.readAt?.toISOString()
      }
    });
  } catch (error) {
    console.error('Error resending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 