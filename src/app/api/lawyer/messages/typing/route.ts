import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientId, isTyping } = await request.json();

    // Update or create typing status
    const typingStatus = await prisma.typingStatus.upsert({
      where: {
        senderId_recipientId: {
          senderId: session.user.id,
          recipientId
        }
      },
      update: {
        isTyping,
        lastUpdated: new Date()
      },
      create: {
        senderId: session.user.id,
        recipientId,
        isTyping,
        lastUpdated: new Date()
      }
    });

    return NextResponse.json(typingStatus);
  } catch (error) {
    console.error('Error updating typing status:', error);
    return NextResponse.json(
      { error: 'Failed to update typing status' },
      { status: 500 }
    );
  }
} 