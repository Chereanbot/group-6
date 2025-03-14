import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Get chat history with pagination
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
        { error: 'Unauthorized: Only lawyers can access chat history' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Find the chat between users
    const chat = await prisma.chat.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [userId, contactId]
            }
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({
        messages: [],
        pagination: {
          total: 0,
          pages: 0,
          currentPage: page,
          perPage: limit
        }
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        chatId: chat.id
      }
    });

    // Get paginated messages
    const messages = await prisma.message.findMany({
      where: {
        chatId: chat.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
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

    // Update unread messages to read
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          chatId: chat.id,
          senderId: contactId,
          recipientId: userId,
          status: 'DELIVERED'
        },
        data: {
          status: 'READ'
        }
      });
    }

    return NextResponse.json({
      messages,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
} 