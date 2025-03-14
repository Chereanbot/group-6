import { NextResponse } from 'next/server';
import { notificationService } from '@/services/notification.service';
import { getServerSession } from 'next-auth';
import { NotificationType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, message, type, priority, link, metadata } = body;

    const notification = await notificationService.create({
      userId,
      title,
      message,
      type: type as NotificationType,
      priority,
      link,
      metadata
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
} 