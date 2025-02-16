import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.recipientId || !data.subject || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        subject: data.subject,
        content: data.content,
        senderId: session.user.id,
        recipientId: data.recipientId,
        priority: data.priority || 'MEDIUM',
        category: data.category || 'GENERAL',
        isRead: false,
        isStarred: false,
        isArchived: false
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            role: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            role: true,
            avatar: true
          }
        }
      }
    });

    // Create notification for recipient
    await prisma.messageNotification.create({
      data: {
        messageId: message.id,
        userId: data.recipientId,
        type: 'NEW_MESSAGE',
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 