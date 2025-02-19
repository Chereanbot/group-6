import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
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

    const { participantId } = await request.json();

    // Check if chat already exists between these users
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId
              }
            }
          },
          {
            participants: {
              some: {
                userId: participantId
              }
            }
          }
        ]
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
                status: true,
                coordinatorProfile: {
                  include: {
                    office: true
                  }
                }
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (existingChat) {
      // Transform to match expected format
      return NextResponse.json({
        id: existingChat.id,
        participants: existingChat.participants,
        messages: existingChat.messages,
        createdAt: existingChat.createdAt,
        updatedAt: existingChat.updatedAt
      });
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
                status: true,
                coordinatorProfile: {
                  include: {
                    office: true
                  }
                }
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json(chat);

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
} 