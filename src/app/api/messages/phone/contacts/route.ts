import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get recent contacts with their last messages
    const contacts = await prisma.phoneMessage.groupBy({
      by: ['phoneNumber'],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
      _max: {
        timestamp: true,
        content: true,
      },
      orderBy: {
        _max: {
          timestamp: 'desc',
        },
      },
    });

    // Get unread count for each contact
    const contactsWithUnread = await Promise.all(
      contacts.map(async (contact) => {
        const unreadCount = await prisma.phoneMessage.count({
          where: {
            phoneNumber: contact.phoneNumber,
            direction: 'INCOMING',
            status: 'DELIVERED',
            userId: session.user.id,
          },
        });

        return {
          phoneNumber: contact.phoneNumber,
          lastMessage: contact._max.content,
          lastMessageTime: contact._max.timestamp,
          unreadCount,
        };
      })
    );

    return NextResponse.json(contactsWithUnread);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 