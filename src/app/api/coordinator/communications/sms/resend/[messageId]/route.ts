import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, MessageStatus, MessageDirection } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const { messageId } = params;

    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please login first" },
        { status: 401 }
      );
    }

    // Verify authentication and check coordinator role
    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is a coordinator
    if (user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Only coordinators can resend messages" },
        { status: 403 }
      );
    }

    // Fetch the original message
    const originalMessage = await prisma.phoneMessage.findUnique({
      where: { id: messageId },
      select: {
        content: true,
        phoneNumber: true,
        userId: true,
        status: true
      }
    });

    if (!originalMessage) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    if (originalMessage.status !== MessageStatus.FAILED) {
      return NextResponse.json(
        { success: false, message: "Only failed messages can be resent" },
        { status: 400 }
      );
    }

    // Create a new message with the same content
    const newMessage = await prisma.phoneMessage.create({
      data: {
        content: originalMessage.content,
        phoneNumber: originalMessage.phoneNumber,
        userId: originalMessage.userId,
        status: MessageStatus.DRAFT,
        direction: MessageDirection.OUTGOING,
        messageId: `RESEND_${messageId}_${Date.now()}`
      }
    });

    return NextResponse.json({
      success: true,
      message: "Message queued for resend",
      newMessageId: newMessage.id
    });

  } catch (error) {
    console.error('Error resending message:', error);
    return NextResponse.json(
      { error: 'Failed to resend message' },
      { status: 500 }
    );
  }
} 