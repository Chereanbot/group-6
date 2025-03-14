import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function sendNotifications(appointment: any, settings: any, userType: string) {
  const userId = userType === 'COORDINATOR' ? appointment.coordinatorId : appointment.clientId;
  
  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'Upcoming Appointment',
      message: `You have an appointment ${
        userType === 'COORDINATOR' 
          ? `with ${appointment.client.fullName}`
          : `with your coordinator`
      } scheduled for ${appointment.scheduledTime.toLocaleString()}`,
      type: 'APPOINTMENT',
      priority: appointment.priority === 'URGENT' ? 'URGENT' : 'NORMAL',
      status: 'UNREAD',
      metadata: {
        appointmentId: appointment.id,
        purpose: appointment.purpose,
        duration: appointment.duration,
        venue: appointment.venue,
        requiredDocuments: appointment.requiredDocuments
      }
    }
  });

  // Send SMS if enabled
  if (settings.smsEnabled) {
    await prisma.smsMessage.create({
      data: {
        recipientId: userId,
        recipientName: userType === 'COORDINATOR' 
          ? appointment.coordinator.fullName 
          : appointment.client.fullName,
        recipientPhone: userType === 'COORDINATOR'
          ? appointment.coordinator.phone
          : appointment.client.phone,
        content: `Reminder: You have an appointment ${
          userType === 'COORDINATOR'
            ? `with ${appointment.client.fullName}`
            : `with your coordinator`
        } at ${appointment.venue || 'the office'} scheduled for ${appointment.scheduledTime.toLocaleString()}. Purpose: ${appointment.purpose}`,
        status: 'PENDING'
      }
    });
  }
}

export async function GET() {
  try {
    // Get current time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all upcoming appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledTime: {
          gte: now,
          lte: tomorrow
        },
        status: 'SCHEDULED'
      },
      include: {
        client: true,
        coordinator: true
      }
    });

    for (const appointment of appointments) {
      const hoursUntilAppointment = Math.round(
        (appointment.scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      );

      // Get coordinator settings
      const coordinatorSettings = await prisma.notificationSettings.findUnique({
        where: {
          userId_userType: {
            userId: appointment.coordinatorId,
            userType: 'COORDINATOR'
          }
        }
      });

      // Get client settings
      const clientSettings = await prisma.notificationSettings.findUnique({
        where: {
          userId_userType: {
            userId: appointment.clientId,
            userType: 'CLIENT'
          }
        }
      });

      // Send notifications based on reminder timing
      if (coordinatorSettings?.reminderTiming && typeof coordinatorSettings.reminderTiming === 'object') {
        const reminderTiming = coordinatorSettings.reminderTiming as { before: number };
        if (reminderTiming.before === hoursUntilAppointment) {
          await sendNotifications(appointment, coordinatorSettings, 'COORDINATOR');
        }
      }

      if (clientSettings?.reminderTiming && typeof clientSettings.reminderTiming === 'object') {
        const reminderTiming = clientSettings.reminderTiming as { before: number };
        if (reminderTiming.before === hoursUntilAppointment) {
          await sendNotifications(appointment, clientSettings, 'CLIENT');
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Failed to process appointment notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process appointment notifications' },
      { status: 500 }
    );
  }
} 