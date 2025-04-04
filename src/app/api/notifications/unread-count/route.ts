import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get count of unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: authResult.user.id,
        status: 'UNREAD'
      }
    });

    // Get count of pending SMS messages
    const pendingSMSCount = await prisma.smsMessage.count({
      where: {
        recipientId: authResult.user.id,
        status: 'PENDING'
      }
    });

    // Total unread count
    const totalUnread = unreadCount + pendingSMSCount;

    return NextResponse.json({
      success: true,
      count: totalUnread
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 