import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    
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
    const userChat = await prisma.userChat.findFirst({
      where: {
        userId,
        chatId
      }
    });

    if (!userChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Archive the chat
    const chat = await prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        isArchived: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(chat);

  } catch (error) {
    console.error('Error archiving chat:', error);
    return NextResponse.json(
      { error: 'Failed to archive chat' },
      { status: 500 }
    );
  }
} 