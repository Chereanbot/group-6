import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        status: 'UNREAD'
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
} 