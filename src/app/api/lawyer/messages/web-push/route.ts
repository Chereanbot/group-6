import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWebPushNotification } from '@/lib/webPush';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, content, subject } = await request.json();

    // Get user's push subscription
    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'User has no push subscription' },
        { status: 400 }
      );
    }

    // Send web push notification
    await sendWebPushNotification(subscription.endpoint, {
      title: subject || 'New Message',
      body: content
    });

    // Store message in database
    const dbMessage = await prisma.message.create({
      data: {
        subject: subject || 'Web Notification',
        content,
        senderId: session.user.id,
        recipientId: userId,
        messageType: 'WEB_PUSH',
        status: 'SENT',
        priority: 'MEDIUM',
        category: 'NOTIFICATION'
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: dbMessage
    });

  } catch (error) {
    console.error('Web Push Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send web push notification' },
      { status: 500 }
    );
  }
} 