import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';
import { MessageStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    // Get the since parameter from the URL
    const url = new URL(request.url);
    const since = url.searchParams.get('since');
    
    // Authenticate user
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

    // Verify user is a participant in the chat
    const userChat = await prisma.userChat.findFirst({
      where: {
        AND: [
          { userId },
          { chatId }
        ]
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Build the where clause for messages query
    const whereClause: any = {
      chatId,
    };

    // Only add the since filter for polling requests
    if (since) {
      whereClause.createdAt = {
        gt: new Date(since)
      };
    }

    // Get messages with proper ordering and includes
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true,
            isOnline: true,
            lastSeen: true
          }
        },
        attachments: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages as read if there are any messages
    if (messages.length > 0) {
      // Update unread count
      await prisma.userChat.update({
        where: {
          userId_chatId: {
            userId,
            chatId
          }
        },
        data: {
          unreadCount: 0
        }
      });

      // Mark messages from other users as READ
      await prisma.message.updateMany({
        where: {
          chatId,
          senderId: {
            not: userId
          },
          status: {
            not: MessageStatus.READ
          }
        },
        data: {
          status: MessageStatus.READ
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

interface MessageAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
  publicId: string;
  resourceType: string;
  format: string;
}

interface CreateMessageRequest {
  content: string;
  attachments?: MessageAttachment[];
  isForwarded?: boolean;
  originalMessageId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    // Authenticate user
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

    // Verify user is a participant in the chat
    const userChat = await prisma.userChat.findUnique({
      where: {
        userId_chatId: {
          userId,
          chatId
        }
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const { content, attachments } = await request.json();

    // Create message
    const message = await prisma.message.create({
      data: {
        text: content,
        senderId: userId,
        chatId,
        status: MessageStatus.SENT,
        ...(attachments && {
          attachments: {
            create: attachments.map(attachment => ({
              url: attachment.url,
              name: attachment.name,
              type: attachment.type,
              size: attachment.size,
              publicId: attachment.publicId,
              resourceType: attachment.resourceType,
              format: attachment.format
            }))
          }
        })
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
        attachments: true
      }
    });

    // Update unread count for other participants
    await prisma.userChat.updateMany({
      where: {
        chatId,
        userId: {
          not: userId
        }
      },
      data: {
        unreadCount: {
          increment: 1
        }
      }
    });

    // Update chat's updatedAt
    await prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json(message);

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chatId: string; messageId: string }> }
) {
  try {
    const { chatId, messageId } = await params;
    
    // Authenticate user
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

    // Verify user is a participant in the chat
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId,
        chatId
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get the message to verify ownership
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
        chatId
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only allow deletion if user is the sender
    if (message.senderId !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
    }

    // Delete the message
    await prisma.message.delete({
      where: {
        id: messageId
      }
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