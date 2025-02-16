import { NextResponse } from 'next/server';
import { notificationService } from '@/services/notification.service';
import { getServerSession } from 'next-auth';
import { NotificationStatus } from '@prisma/client';
import { NotificationType } from '@prisma/client';

// Get user notifications
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const offset = Number(searchParams.get('offset')) || 0;
    const status = searchParams.getAll('status') as NotificationStatus[];
    const type = searchParams.getAll('type') as NotificationType[];

    const notifications = await notificationService.getUserNotifications(
      session.user.id,
      { status, type, limit, offset }
    );

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 