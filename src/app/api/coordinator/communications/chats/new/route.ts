import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function POST(request: Request) {
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

    const { participantId, participantType = 'USER' } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Handle kebele member chats
    if (participantType === 'KEBELE_MEMBER') {
      // First verify the resident exists
      const resident = await prisma.resident.findUnique({
        where: { id: participantId },
        include: {
          kebele: {
            select: {
              id: true,
              kebeleName: true,
              subCity: true,
              district: true
            }
          }
        }
      });

      if (!resident) {
        return NextResponse.json(
          { error: 'Kebele member not found' },
          { status: 404 }
        );
      }

      // Check if chat already exists with this resident
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
                  residentId: participantId
                }
              }
            }
          ]
        },
        include: {
          participants: true
        }
      });

      if (existingChat) {
        return NextResponse.json({
          id: existingChat.id,
          user: {
            id: resident.id,
            fullName: resident.fullName,
            email: resident.email,
            userRole: 'KEBELE_MEMBER' as UserRoleEnum,
            isOnline: false,
            lastSeen: null,
            status: 'ACTIVE',
            kebeleProfile: {
              kebeleName: resident.kebele.kebeleName,
              subCity: resident.kebele.subCity,
              district: resident.kebele.district,
              phone: resident.phone
            }
          },
          unreadCount: 0,
          lastMessage: null
        });
      }

      // Create new chat with resident
      const newChat = await prisma.chat.create({
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          participants: {
            create: [
              {
                userId,
                unreadCount: 0
              },
              {
                residentId: resident.id,
                unreadCount: 0
              }
            ]
          }
        }
      });

      return NextResponse.json({
        id: newChat.id,
        user: {
          id: resident.id,
          fullName: resident.fullName,
          email: resident.email,
          userRole: 'KEBELE_MEMBER' as UserRoleEnum,
          isOnline: false,
          lastSeen: null,
          status: 'ACTIVE',
          kebeleProfile: {
            kebeleName: resident.kebele.kebeleName,
            subCity: resident.kebele.subCity,
            district: resident.kebele.district,
            phone: resident.phone
          }
        },
        unreadCount: 0,
        lastMessage: null
      });
    }

    // Handle kebele manager chats
    if (participantType === 'KEBELE_MANAGER') {
      const kebeleManager = await prisma.kebeleManager.findUnique({
        where: { id: participantId },
        include: {
          kebele: {
            select: {
              kebeleName: true,
              subCity: true,
              district: true
            }
          }
        }
      });

      if (!kebeleManager) {
        return NextResponse.json(
          { error: 'Kebele manager not found' },
          { status: 404 }
        );
      }

      // Create chat with kebele manager
      const chat = await prisma.chat.create({
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          participants: {
            create: [
              {
                userId,
                unreadCount: 0
              },
              {
                kebeleManagerId: kebeleManager.id,
                unreadCount: 0
              }
            ]
          }
        }
      });

      return NextResponse.json({
        id: chat.id,
        user: {
          id: kebeleManager.id,
          fullName: kebeleManager.fullName,
          email: kebeleManager.email,
          userRole: 'KEBELE_MANAGER' as UserRoleEnum,
          isOnline: false,
          lastSeen: null,
          status: 'ACTIVE',
          kebeleProfile: {
            kebeleName: kebeleManager.kebele.kebeleName,
            subCity: kebeleManager.kebele.subCity,
            district: kebeleManager.kebele.district,
            position: kebeleManager.position,
            phone: kebeleManager.phone
          }
        },
        unreadCount: 0,
        lastMessage: null
      });
    }

    // Handle regular users (admins, lawyers)
    // Check if chat already exists between the users
    const existingChats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId
          }
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

    const existingChat = existingChats.find(chat => 
      chat.participants.some(p => p.userId === participantId)
    );

    if (existingChat) {
      const otherParticipant = existingChat.participants.find(p => p.userId !== userId);
      return NextResponse.json({
        id: existingChat.id,
        user: otherParticipant?.user,
        unreadCount: 0,
        lastMessage: null
      });
    }

    // Create new chat for regular users
    const newChat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            {
              userId,
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

    const otherParticipant = newChat.participants.find(p => p.userId !== userId);
    return NextResponse.json({
      id: newChat.id,
      user: otherParticipant?.user,
      unreadCount: 0,
      lastMessage: null
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
} 