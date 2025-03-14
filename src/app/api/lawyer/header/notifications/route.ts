import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can access notifications' },
        { status: 403 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        type: {
          in: ['SERVICE_REQUEST', 'DOCUMENT_UPLOAD', 'PAYMENT', 'APPOINTMENT', 'CHAT_MESSAGE', 'SYSTEM_UPDATE', 'TASK_ASSIGNED', 'DEADLINE_REMINDER', 'STATUS_UPDATE', 'VERIFICATION', 'NEW_MESSAGE', 'MENTION', 'REPLY', 'REACTION', 'THREAD_UPDATE', 'FOLLOW_UP']
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        case: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');
    const { notificationId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can delete notifications' },
        { status: 403 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: userId
      }
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 