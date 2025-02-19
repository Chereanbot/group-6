import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MessageCategory, MessagePriority, MessageStatus } from '@prisma/client';
import { UserRoleEnum } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

// Update user's online status and last seen
async function updateUserOnlineStatus(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline: true,
      lastSeen: new Date()
    }
  });
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const lastMessageTimestamp = searchParams.get('lastMessageTimestamp');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get other user's info
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        userRole: true
      }
    });

    if (!otherUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate the timestamp for fetching new messages
    let timestampCondition = {};
    if (lastMessageTimestamp) {
      timestampCondition = {
        createdAt: {
          gt: new Date(lastMessageTimestamp)
        }
      };
    }

    // Fetch messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: authResult.user.id,
            recipientId: userId
          },
          {
            senderId: userId,
            recipientId: authResult.user.id
          }
        ],
        ...timestampCondition
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
        createdAt: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Mark messages as read
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          recipientId: authResult.user.id,
          senderId: userId,
          isRead: false
        },
        data: {
          isRead: true,
          status: 'READ'
        }
      });
    }

    // Get unread count
    const unreadCount = await prisma.message.count({
      where: {
        recipientId: authResult.user.id,
        senderId: userId,
        isRead: false
      }
    });

    // Process messages
    const processedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      timestamp: msg.createdAt,
      status: msg.status || 'SENT',
      isRead: Boolean(msg.isRead),
      sender: {
        id: msg.sender.id,
        name: msg.sender.fullName,
        role: msg.sender.userRole
      },
      recipient: {
        id: msg.recipient.id,
        name: msg.recipient.fullName,
        role: msg.recipient.userRole
      }
    }));

    return NextResponse.json({
      success: true,
      messages: processedMessages,
      metadata: {
        totalMessages: messages.length,
        currentPage: page,
        unreadCount,
        otherUser: {
          id: otherUser.id,
          name: otherUser.fullName,
          role: otherUser.userRole
        },
        lastMessageTimestamp: processedMessages.length > 0 
          ? processedMessages[processedMessages.length - 1].timestamp 
          : null
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Update sender's online status
    await updateUserOnlineStatus(authResult.user.id);

    const body = await req.json();
    const { content, recipientId } = body;

    if (!content || !recipientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the message with real-time metadata
    const message = await prisma.message.create({
      data: {
        content,
        senderId: authResult.user.id,
        recipientId,
        status: 'SENT',
        createdAt: new Date(),
        isRead: false
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
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true,
            isOnline: true,
            lastSeen: true
          }
        }
      }
    });

    // Process the message with real-time status
    const processedMessage = {
      ...message,
      timestamp: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.fullName,
        role: message.sender.userRole,
        isOnline: message.sender.isOnline,
        lastSeen: message.sender.lastSeen
      },
      recipient: {
        id: message.recipient.id,
        name: message.recipient.fullName,
        role: message.recipient.userRole,
        isOnline: message.recipient.isOnline,
        lastSeen: message.recipient.lastSeen
      }
    };

    return NextResponse.json({ 
      success: true, 
      message: processedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
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