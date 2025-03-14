import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Get messages for a specific contact
export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can access messages' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Get messages between lawyer and contact
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: contactId },
          { senderId: contactId, recipientId: userId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            userRole: true,
            status: true,
            lastSeen: true,
            isOnline: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            userRole: true,
            status: true,
            lastSeen: true,
            isOnline: true
          }
        }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Send a new message
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can send messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { receiverId, text } = body;

    if (!receiverId || !text) {
      return NextResponse.json(
        { error: 'Receiver ID and text are required' },
        { status: 400 }
      );
    }

    // Find or create a chat between the users
    let chat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, receiverId]
            }
          }
        }
      }
    });

    if (!chat) {
      // Create a new chat
      chat = await prisma.chat.create({
        data: {
          participants: {
            create: [
              { userId: userId },
              { userId: receiverId }
            ]
          }
        }
      });
    }

    // Create new message
    const message = await prisma.message.create({
      data: {
        text,
        senderId: userId,
        recipientId: receiverId,
        chatId: chat.id,
        status: 'SENT'
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            userRole: true,
            status: true,
            lastSeen: true,
            isOnline: true
          }
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            userRole: true,
            status: true,
            lastSeen: true,
            isOnline: true
          }
        }
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