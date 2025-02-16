import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: params.messageId }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: { isArchived: !message.isArchived }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error archiving message:', error);
    return NextResponse.json(
      { error: 'Failed to archive message' },
      { status: 500 }
    );
  }
} 