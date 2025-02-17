import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in.' }),
        { status: 403 }
      );
    }

    // Fetch notifications for the coordinator
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to 10 most recent notifications
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch notifications' }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { message, userId } = await request.json();

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in.' }),
        { status: 403 }
      );
    }

    // Create a new notification
    const notification = await prisma.notification.create({
      data: {
        message,
        userId,
        read: false,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create notification' }),
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { notificationId } = await request.json();

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in.' }),
        { status: 403 }
      );
    }

    // Mark notification as read
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update notification' }),
      { status: 500 }
    );
  }
} 