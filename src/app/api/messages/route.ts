import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MessageCategory, MessagePriority, MessageStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { recipientId: session.user.id },
          { senderId: session.user.id }
        ]
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true, messages }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to fetch messages:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, subject, content, category, priority } = body;

    if (!recipientId || !content) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        subject,
        content,
        category: category || MessageCategory.GENERAL,
        priority: priority || MessagePriority.NORMAL,
        status: MessageStatus.SENT
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

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: 'New Message',
        message: `You have a new message from ${session.user.name || session.user.email}`,
        type: 'NEW_MESSAGE',
        link: `/admin/messages?id=${message.id}`
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true, message }),
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Failed to send message:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId, isRead, isStarred, isArchived } = body;

    if (!messageId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Message ID is required' }),
        { status: 400 }
      );
    }

    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: isRead !== undefined ? isRead : undefined,
        isStarred: isStarred !== undefined ? isStarred : undefined,
        isArchived: isArchived !== undefined ? isArchived : undefined
      }
    });

    return new NextResponse(
      JSON.stringify({ success: true, message }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to update message:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Message ID is required' }),
        { status: 400 }
      );
    }

    // Only allow deletion if user is sender or recipient
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      }
    });

    if (!message) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Message not found or unauthorized' }),
        { status: 404 }
      );
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Failed to delete message:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
} 