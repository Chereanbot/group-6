import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';
import { MessageStatus, NotificationType, NotificationPriority } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      const token = request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

      if (token) {
        const authResult = await verifyAuth(token);
        if (authResult.isAuthenticated && authResult.user) {
          userId = authResult.user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is coordinator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userRole: true }
    });

    if (user?.userRole !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const since = searchParams.get('since');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Verify chat exists and user is a participant
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId: userId,
        chatId: chatId
      },
      include: {
        chat: true
      }
    });

    if (!userChat) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Build where clause
    const whereClause: any = {
      chatId: chatId
    };

    if (since) {
      whereClause.createdAt = {
        gt: new Date(since)
      };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            userRole: true
          }
        },
        attachments: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages as read if they were sent to this user
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: messages
              .filter(m => m.recipientId === userId && m.status === MessageStatus.SENT)
              .map(m => m.id)
          }
        },
        data: {
          status: MessageStatus.READ
        }
      });

      // Update unread count in UserChat
      await prisma.userChat.update({
        where: {
          userId_chatId: {
            userId: userId,
            chatId: chatId
          }
        },
        data: {
          unreadCount: 0
        }
      });
    }

    return NextResponse.json(messages);

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get coordinator ID from session
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      const token = request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

      if (token) {
        const authResult = await verifyAuth(token);
        if (authResult.isAuthenticated && authResult.user) {
          userId = authResult.user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is coordinator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userRole: true, fullName: true }
    });

    if (user?.userRole !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get chatId from query parameters
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const { content, attachments } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Verify chat exists and user is a participant
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId: userId,
        chatId: chatId
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    userRole: true,
                    lastSeen: true,
                    isOnline: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!userChat) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    // Find the recipient (other participant)
    const recipient = userChat.chat.participants.find(p => p.userId !== userId)?.user;
    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        text: content,
        senderId: userId,
        recipientId: recipient.id,
        chatId: chatId,
        status: MessageStatus.SENT,
        attachments: attachments ? {
          create: attachments.map((attachment: any) => ({
            url: attachment.url,
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            publicId: attachment.publicId,
            resourceType: attachment.resourceType,
            format: attachment.format
          }))
        } : undefined
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            userRole: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            userRole: true
          }
        },
        attachments: true
      }
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    // Update recipient's unread count
    await prisma.userChat.update({
      where: {
        userId_chatId: {
          userId: recipient.id,
          chatId: chatId
        }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipient.id,
        type: NotificationType.CHAT_MESSAGE,
        title: 'New Message',
        message: `New message from ${user.fullName}`,
        priority: NotificationPriority.NORMAL,
        metadata: {
          chatId: chatId,
          messageId: message.id
        }
      }
    });

    return NextResponse.json(message);

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
} 