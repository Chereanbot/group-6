import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chats = await prisma.userChat.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                    isOnline: true,
                    lastSeen: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
} 