import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { status: 'UNREAD' },
          {
            AND: [
              { status: 'READ' },
              { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
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

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    const body = await request.json();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { notificationId, status } = body;

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id
      },
      data: {
        status,
        ...(status === 'READ' && { readAt: new Date() })
      }
    });

    return NextResponse.json(updatedNotification);

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
} 