import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';

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
      select: { userRole: true, fullName: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.userRole !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all chats for the coordinator
    const userChats = await prisma.userChat.findMany({
      where: {
        userId: userId
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
            },
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1,
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
                }
              }
            }
          }
        }
      },
      orderBy: {
        chat: {
          updatedAt: 'desc'
        }
      }
    });

    // Transform the response to match the expected format
    const transformedChats = userChats.map(userChat => {
      const chat = userChat.chat;
      const otherParticipant = chat.participants.find(p => p.userId !== userId)?.user;
      const lastMessage = chat.messages[0];

      return {
        id: chat.id,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          text: lastMessage.text,
          createdAt: lastMessage.createdAt,
          sender: lastMessage.senderId === userId ? {
            id: userId,
            fullName: user.fullName,
            userRole: user.userRole
          } : {
            id: lastMessage.sender.id,
            fullName: lastMessage.sender.fullName,
            userRole: lastMessage.sender.userRole
          }
        } : null,
        user: otherParticipant ? {
          id: otherParticipant.id,
          fullName: otherParticipant.fullName,
          userRole: otherParticipant.userRole,
          lastSeen: otherParticipant.lastSeen,
          isOnline: otherParticipant.isOnline,
          status: otherParticipant.status
        } : null,
        unreadCount: userChat.unreadCount
      };
    });

    return NextResponse.json(transformedChats);

  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Verify user is coordinator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userRole: true, fullName: true }
    });

    if (user?.userRole !== 'COORDINATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Verify participant exists and is not the same as coordinator
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        fullName: true,
        userRole: true,
        lastSeen: true,
        isOnline: true,
        status: true
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    if (participant.id === userId) {
      return NextResponse.json(
        { error: 'Cannot create chat with yourself' },
        { status: 400 }
      );
    }

    // Check if chat already exists
    const existingChat = await prisma.userChat.findFirst({
      where: {
        userId: userId,
        chat: {
          participants: {
            some: {
              userId: participantId
            }
          }
        }
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

    if (existingChat) {
      const otherParticipant = existingChat.chat.participants.find(p => p.userId !== userId)?.user;
      return NextResponse.json({
        id: existingChat.chat.id,
        createdAt: existingChat.chat.createdAt,
        updatedAt: existingChat.chat.updatedAt,
        lastMessage: null,
        user: otherParticipant ? {
          id: otherParticipant.id,
          fullName: otherParticipant.fullName,
          userRole: otherParticipant.userRole,
          lastSeen: otherParticipant.lastSeen,
          isOnline: otherParticipant.isOnline,
          status: otherParticipant.status
        } : null,
        unreadCount: existingChat.unreadCount
      });
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            {
              userId: userId,
              unreadCount: 0,
              isStarred: false
            },
            {
              userId: participantId,
              unreadCount: 0,
              isStarred: false
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
                userRole: true,
                lastSeen: true,
                isOnline: true,
                status: true
              }
            }
          }
        }
      }
    });

    const otherParticipant = chat.participants.find(p => p.userId !== userId)?.user;
    return NextResponse.json({
      id: chat.id,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessage: null,
      user: otherParticipant ? {
        id: otherParticipant.id,
        fullName: otherParticipant.fullName,
        userRole: otherParticipant.userRole,
        lastSeen: otherParticipant.lastSeen,
        isOnline: otherParticipant.isOnline,
        status: otherParticipant.status
      } : null,
      unreadCount: 0
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
} 