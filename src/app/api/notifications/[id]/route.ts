import { NextResponse } from 'next/server';
import { notificationService } from '@/services/notification.service';
import { getServerSession } from 'next-auth';

// Mark notification as read
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notification = await notificationService.markAsRead(
      params.id,
      session.user.id
    );

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

// Delete notification
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await notificationService.delete(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 