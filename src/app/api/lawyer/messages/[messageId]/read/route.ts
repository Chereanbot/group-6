import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: params.messageId }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.recipientId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to mark this message as read' },
        { status: 403 }
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    );
  }
} 