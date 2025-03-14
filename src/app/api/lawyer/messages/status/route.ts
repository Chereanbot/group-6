import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Update message status (read, delivered)
export async function PATCH(request: Request) {
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
        { error: 'Unauthorized: Only lawyers can update message status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageId, status } = body;

    if (!messageId || !status) {
      return NextResponse.json(
        { error: 'Message ID and status are required' },
        { status: 400 }
      );
    }

    // Verify the message exists and belongs to the user
    const existingMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      }
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found or access denied' },
        { status: 404 }
      );
    }

    // Update message status
    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId
      },
      data: {
        status
      },
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

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message status:', error);
    return NextResponse.json(
      { error: 'Failed to update message status' },
      { status: 500 }
    );
  }
} 