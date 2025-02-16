import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function DELETE(
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

    // Only allow deletion if user is sender or recipient
    if (message.senderId !== session.user.id && message.recipientId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id: params.messageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true,
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true,
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only allow access if user is sender or recipient
    if (message.senderId !== session.user.id && message.recipientId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to view this message' }, { status: 403 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
} 