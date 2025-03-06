import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // If no session, try JWT token
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

    // Get all chats for the user
    const userChats = await prisma.userChat.findMany({
      where: {
        userId
      },
      include: {
        chat: {
          include: {
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              }
            },
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    userRole: true,
                    isOnline: true,
                    lastSeen: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform the data to match the expected format
    const transformedChats = userChats.map(userChat => ({
      id: userChat.chatId,
      user: userChat.chat.participants.find(p => p.userId !== userId)?.user,
      unreadCount: userChat.unreadCount,
      lastMessage: userChat.chat.messages[0] || null
    }));

    return NextResponse.json(transformedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            {
              userId: userId,
              unreadCount: 0
            },
            {
              userId: participantId,
              unreadCount: 0
            }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                userRole: true,
                isOnline: true,
                lastSeen: true,
                status: true
              }
            }
          }
        }
      }
    });

    // Transform the response to match the expected format
    const otherParticipant = chat.participants.find(p => p.userId !== userId);
    const transformedChat = {
      id: chat.id,
      user: otherParticipant?.user,
      unreadCount: 0,
      lastMessage: null
    };

    return NextResponse.json(transformedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
} 