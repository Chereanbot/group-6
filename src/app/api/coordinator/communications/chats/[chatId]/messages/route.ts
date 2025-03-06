import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';
import { MessageStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
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

    // Get the chat participants
    const userChat = await prisma.userChat.findFirst({
      where: {
        chatId: params.chatId,
        userId
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { chatId: params.chatId },
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
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    if (messages.length > 0) {
      // Update unread count
      await prisma.userChat.update({
        where: {
          userId_chatId: {
            userId,
            chatId: params.chatId
          }
        },
        data: { unreadCount: 0 }
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          chatId: params.chatId,
          senderId: { not: userId },
          status: { not: MessageStatus.READ }
        },
        data: { status: MessageStatus.READ }
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
  { params }: { params: { chatId: string } }
) {
  try {
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

    // Get the chat and verify the sender is a participant
    const userChat = await prisma.userChat.findFirst({
      where: {
        chatId: params.chatId,
        userId
      },
      include: {
        chat: {
          include: {
            participants: true
          }
        }
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const { content, attachments, isForwarded, originalMessageId } = await request.json();

    // Create the message
    const message = await prisma.message.create({
      data: {
        text: content,
        senderId: userId,
        chatId: params.chatId,
        status: MessageStatus.SENT,
        isForwarded: isForwarded || false,
        originalMessageId,
        ...(attachments && {
          attachments: {
            create: attachments.map((attachment: any) => ({
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
            userRole: true,
            isOnline: true,
            lastSeen: true
          }
        },
        attachments: true
      }
    });

    // Update unread count for other participants
    await Promise.all(userChat.chat.participants
      .filter(p => p.userId !== userId)
      .map(participant => 
        prisma.userChat.update({
          where: {
            userId_chatId: {
              userId: participant.userId,
              chatId: params.chatId
            }
          },
          data: {
            unreadCount: {
              increment: 1
            }
          }
        })
      )
    );

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: params.chatId },
      data: { updatedAt: new Date() }
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
  { params }: { params: { chatId: string; messageId: string } }
) {
  try {
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
          chatId: params.chatId
        }
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get the message to verify ownership
    const message = await prisma.message.findUnique({
      where: {
        id: params.messageId,
        chatId: params.chatId
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
        id: params.messageId
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