import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to check upcoming appointments and send notifications
async function checkAndSendAppointmentNotifications(userId: string, userType: string) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get user's notification settings
  const settings = await prisma.notificationSettings.findUnique({
    where: {
      userId_userType: {
        userId,
        userType
      }
    }
  });

  if (!settings?.automaticNotifications) {
    return;
  }

  // Get upcoming appointments based on user type
  const appointments = await prisma.appointment.findMany({
    where: {
      ...(userType === 'COORDINATOR' 
        ? { coordinatorId: userId }
        : { clientId: userId }),
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

  // Send notifications for each upcoming appointment
  for (const appointment of appointments) {
    const hoursUntilAppointment = Math.round(
      (appointment.scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    // Check if we should send notification based on reminder timing
    const reminderTiming = settings.reminderTiming as { before: number };
    if (reminderTiming.before === hoursUntilAppointment) {
      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          title: 'Upcoming Appointment Reminder',
          message: `You have an appointment ${
            userType === 'COORDINATOR' 
              ? `with ${appointment.client.fullName}`
              : `with your coordinator`
          } scheduled for ${appointment.scheduledTime.toLocaleString()}`,
          type: 'APPOINTMENT',
          priority: 'NORMAL',
          status: 'UNREAD',
          metadata: {
            appointmentId: appointment.id,
            purpose: appointment.purpose,
            duration: appointment.duration
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
            } scheduled for ${appointment.scheduledTime.toLocaleString()}`,
            status: 'PENDING'
          }
        });
      }
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.notificationSettings.findUnique({
      where: {
        userId_userType: {
          userId: session.user.id,
          userType: 'COORDINATOR'
        }
      }
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        settings: {
          automaticNotifications: true,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          reminderTiming: {
            before: 24,
            frequency: 'once',
            customIntervals: [24, 12, 1],
          },
          priorityLevels: {
            urgent: true,
            high: true,
            medium: true,
            low: true,
          },
          templates: {
            confirmation: 'Your appointment has been confirmed for {date} at {time}.',
            reminder: 'Reminder: You have an appointment scheduled for {date} at {time}.',
            cancellation: 'Your appointment for {date} at {time} has been cancelled.',
            rescheduling: 'Your appointment has been rescheduled to {date} at {time}.',
          },
          workingHours: {
            start: '09:00',
            end: '17:00',
          },
          blackoutDates: [],
          customRules: [],
        }
      });
    }

    // Check and send notifications for upcoming appointments
    await checkAndSendAppointmentNotifications(session.user.id, 'COORDINATOR');

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Failed to fetch notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.automaticNotifications || !data.templates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.notificationSettings.upsert({
      where: {
        userId_userType: {
          userId: session.user.id,
          userType: 'COORDINATOR'
        }
      },
      update: {
        automaticNotifications: data.automaticNotifications,
        emailEnabled: data.emailEnabled,
        smsEnabled: data.smsEnabled,
        pushEnabled: data.pushEnabled,
        reminderTiming: data.reminderTiming,
        priorityLevels: data.priorityLevels,
        templates: data.templates,
        workingHours: data.workingHours,
        blackoutDates: data.blackoutDates || [],
        customRules: data.customRules || [],
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        userType: 'COORDINATOR',
        automaticNotifications: data.automaticNotifications,
        emailEnabled: data.emailEnabled,
        smsEnabled: data.smsEnabled,
        pushEnabled: data.pushEnabled,
        reminderTiming: data.reminderTiming,
        priorityLevels: data.priorityLevels,
        templates: data.templates,
        workingHours: data.workingHours,
        blackoutDates: data.blackoutDates || [],
        customRules: data.customRules || [],
      },
    });

    // Check and send notifications for upcoming appointments after settings update
    await checkAndSendAppointmentNotifications(session.user.id, 'COORDINATOR');

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
} 