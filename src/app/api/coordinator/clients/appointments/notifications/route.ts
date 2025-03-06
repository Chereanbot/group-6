import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { NotificationType, NotificationStatus, Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization') ?? '';
    const cookies = headersList.get('cookie') ?? '';
    
    const token = authHeader.split(' ')[1] || 
                 cookies.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { appointmentId, message, title } = body;

    // Get the appointment and client details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.client.phone) {
      return NextResponse.json(
        { success: false, message: 'Client phone number not found' },
        { status: 400 }
      );
    }

    // Create notification record
    const notificationData: Prisma.NotificationCreateInput = {
      type: NotificationType.APPOINTMENT,
      title: title || 'Appointment Notification',
      message,
      status: NotificationStatus.UNREAD,
      user: {
        connect: { id: appointment.clientId }
      },
      case: appointment.serviceRequestId ? {
        connect: { id: appointment.serviceRequestId }
      } : undefined,
      metadata: {
        appointmentId,
        scheduledTime: appointment.scheduledTime.toISOString(),
        purpose: appointment.purpose,
        venue: appointment.venue
      }
    };

    const notification = await prisma.notification.create({
      data: notificationData
    });

    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization') ?? '';
    const cookies = headersList.get('cookie') ?? '';
    
    const token = authHeader.split(' ')[1] || 
                 cookies.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Get notifications for the appointment
    const notifications = await prisma.notification.findMany({
      where: {
        type: NotificationType.APPOINTMENT,
        metadata: {
          equals: {
            appointmentId
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization') ?? '';
    const cookies = headersList.get('cookie') ?? '';
    
    const token = authHeader.split(' ')[1] || 
                 cookies.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id, status } = await request.json();

    if (!Object.values(NotificationStatus).includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification status' },
        { status: 400 }
      );
    }

    // Update notification status
    const notification = await prisma.notification.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    );
  }
} 