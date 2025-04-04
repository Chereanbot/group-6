import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, MessageStatus } from '@prisma/client';

export async function GET(
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
        { success: false, message: "Unauthorized: Only coordinators can view message status" },
        { status: 403 }
      );
    }

    // Fetch message and its status
    const message = await prisma.phoneMessage.findUnique({
      where: { id: messageId },
      select: {
        status: true,
        timestamp: true,
        content: true,
        phoneNumber: true
      }
    });

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    // Return the message status as history
    return NextResponse.json({
      success: true,
      history: [{
        status: message.status,
        timestamp: message.timestamp,
        details: 'Current message status'
      }]
    });

  } catch (error) {
    console.error('Error fetching message status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message status' },
      { status: 500 }
    );
  }
} 