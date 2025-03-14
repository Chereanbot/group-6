import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, MessageDirection } from '@prisma/client';

export async function GET(req: Request) {
  try {
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
        { success: false, message: "Unauthorized: Only coordinators can view SMS history" },
        { status: 403 }
      );
    }

    // Build where clause
    const where = {
      userId: user.id,
      direction: MessageDirection.OUTGOING
    };

    // Fetch recent messages
    const messages = await prisma.phoneMessage.findMany({
      where,
      select: {
        id: true,
        content: true,
        status: true,
        phoneNumber: true,
        messageId: true,
        timestamp: true,
        userId: true,
        direction: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50,
      skip: 0
    });

    // Get user details for the messages
    const userIds = [...new Set(messages.map(msg => msg.userId))];
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        fullName: true,
        userRole: true
      }
    });

    // Create a map of user details
    const userMap = new Map(users.map(user => [user.id, user]));

    // Transform the messages to match the expected format in the frontend
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      recipientId: msg.userId,
      recipientName: userMap.get(msg.userId)?.fullName || 'Unknown',
      recipientPhone: msg.phoneNumber,
      content: msg.content,
      status: msg.status,
      createdAt: msg.timestamp
    }));

    return NextResponse.json({
      success: true,
      messages: transformedMessages
    });

  } catch (error) {
    console.error('Error fetching recent SMS messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent messages' },
      { status: 500 }
    );
  }
} 