import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    // Get the original message
    const originalMessage = await prisma.message.findUnique({
      where: { id: params.messageId }
    });

    if (!originalMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Create new forwarded message
    const forwardedMessage = await prisma.message.create({
      data: {
        subject: `Fwd: ${originalMessage.subject}`,
        content: originalMessage.content,
        sender: {
          connect: { id: session.user.id }
        },
        recipient: {
          connect: { id: recipientId }
        },
        priority: originalMessage.priority,
        category: originalMessage.category,
        isRead: false,
        isStarred: false,
        isArchived: false
      },
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

    return NextResponse.json(forwardedMessage);
  } catch (error) {
    console.error('Error forwarding message:', error);
    return NextResponse.json(
      { error: 'Failed to forward message' },
      { status: 500 }
    );
  }
} 