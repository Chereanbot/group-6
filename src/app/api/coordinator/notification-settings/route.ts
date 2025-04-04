import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

// Helper function to check upcoming appointments and send notifications
async function checkAndSendAppointmentNotifications(userId: string, userType: string) {
  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

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

  // Get upcoming appointments for next 3 days with related users
  const appointments = await prisma.appointment.findMany({
    where: {
      ...(userType === 'COORDINATOR' 
        ? { coordinatorId: userId }
        : { clientId: userId }),
      scheduledTime: {
        gte: now,
        lte: threeDaysFromNow
      },
      status: 'SCHEDULED'
    },
    include: {
      client: true,
      coordinator: true
    }
  });

  // Standard reminder intervals (in hours)
  const reminderIntervals = [72, 48, 24, 2]; // 3 days, 2 days, 1 day, and 2 hours before

  // Send notifications for each upcoming appointment
  for (const appointment of appointments) {
    const hoursUntilAppointment = Math.round(
      (appointment.scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    // Check if we should send notification based on reminder timing
    const reminderTiming = settings.reminderTiming as { before: number; frequency: string; customIntervals?: number[] };
    const intervalsToCheck = reminderTiming.frequency === 'custom' && reminderTiming.customIntervals 
      ? reminderTiming.customIntervals 
      : reminderIntervals;

    // Find the closest reminder interval
    const shouldSendReminder = intervalsToCheck.some(interval => 
      Math.abs(interval - hoursUntilAppointment) < 1 // Within 1 hour of the interval
    );

    if (shouldSendReminder) {
      // Get notification settings for both users
      const [coordinatorSettings, clientSettings] = await Promise.all([
        prisma.notificationSettings.findUnique({
          where: {
            userId_userType: {
              userId: appointment.coordinatorId,
              userType: 'COORDINATOR'
            }
          }
        }),
        prisma.notificationSettings.findUnique({
          where: {
            userId_userType: {
              userId: appointment.clientId,
              userType: 'CLIENT'
            }
          }
        })
      ]);

      // Send notification to coordinator if enabled
      if (coordinatorSettings?.automaticNotifications) {
        // Create notification
        await prisma.notification.create({
          data: {
            user: {
              connect: {
                id: appointment.coordinatorId
              }
            },
            title: 'Upcoming Appointment Reminder',
            message: `You have an appointment with ${appointment.client.fullName} scheduled for ${appointment.scheduledTime.toLocaleString()}`,
            type: 'APPOINTMENT',
            priority: hoursUntilAppointment <= 2 ? 'URGENT' : 'NORMAL',
            status: 'UNREAD',
            metadata: {
              appointmentId: appointment.id,
              purpose: appointment.purpose,
              duration: appointment.duration,
              hoursUntil: hoursUntilAppointment
            }
          }
        });

        // Send SMS if enabled
        if (coordinatorSettings.smsEnabled && appointment.coordinator.phone) {
          await prisma.smsMessage.create({
            data: {
              recipientId: appointment.coordinatorId,
              recipientName: appointment.coordinator.fullName,
              recipientPhone: appointment.coordinator.phone,
              content: `Reminder: You have an appointment with ${appointment.client.fullName} scheduled for ${appointment.scheduledTime.toLocaleString()}`,
              status: 'PENDING'
            }
          });
        }
      }

      // Send notification to client if enabled
      if (clientSettings?.automaticNotifications) {
        // Create notification
        await prisma.notification.create({
          data: {
            user: {
              connect: {
                id: appointment.clientId
              }
            },
            title: 'Upcoming Appointment Reminder',
            message: `You have an appointment with your coordinator scheduled for ${appointment.scheduledTime.toLocaleString()}`,
            type: 'APPOINTMENT',
            priority: hoursUntilAppointment <= 2 ? 'URGENT' : 'NORMAL',
            status: 'UNREAD',
            metadata: {
              appointmentId: appointment.id,
              purpose: appointment.purpose,
              duration: appointment.duration,
              hoursUntil: hoursUntilAppointment
            }
          }
        });

        // Send SMS if enabled
        if (clientSettings.smsEnabled && appointment.client.phone) {
          await prisma.smsMessage.create({
            data: {
              recipientId: appointment.clientId,
              recipientName: appointment.client.fullName,
              recipientPhone: appointment.client.phone,
              content: `Reminder: You have an appointment with your coordinator scheduled for ${appointment.scheduledTime.toLocaleString()}`,
              status: 'PENDING'
            }
          });
        }
      }
    }
  }
}

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
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: {
        userId_userType: {
          userId: authResult.user.id,
          userType: 'COORDINATOR'
        }
      }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: authResult.user.id,
          userType: 'COORDINATOR',
          automaticNotifications: true,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          reminderTiming: {
            before: 24,
            frequency: 'once'
          },
          priorityLevels: {
            urgent: true,
            high: true,
            medium: true,
            low: true
          },
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          blackoutDates: [],
          customRules: [],
          templates: {
            confirmation: 'Your appointment has been confirmed for {date} at {time}.',
            reminder: 'Reminder: You have an appointment scheduled for {date} at {time}.',
            cancellation: 'Your appointment for {date} at {time} has been cancelled.',
            rescheduling: 'Your appointment has been rescheduled to {date} at {time}.'
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        reminderTiming: settings.reminderTiming as any,
        priorityLevels: settings.priorityLevels as any,
        workingHours: settings.workingHours as any,
        blackoutDates: settings.blackoutDates as any,
        customRules: settings.customRules as any,
        templates: settings.templates as any
      }
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      automaticNotifications,
      emailEnabled,
      smsEnabled,
      pushEnabled,
      reminderTiming,
      priorityLevels,
      workingHours,
      blackoutDates,
      customRules,
      templates
    } = body;

    const settings = await prisma.notificationSettings.upsert({
      where: {
        userId_userType: {
          userId: authResult.user.id,
          userType: 'COORDINATOR'
        }
      },
      update: {
        automaticNotifications,
        emailEnabled,
        smsEnabled,
        pushEnabled,
        reminderTiming,
        priorityLevels,
        workingHours,
        blackoutDates,
        customRules,
        templates
      },
      create: {
        userId: authResult.user.id,
        userType: 'COORDINATOR',
        automaticNotifications,
        emailEnabled,
        smsEnabled,
        pushEnabled,
        reminderTiming,
        priorityLevels,
        workingHours,
        blackoutDates,
        customRules,
        templates: templates || {
          confirmation: 'Your appointment has been confirmed for {date} at {time}.',
          reminder: 'Reminder: You have an appointment scheduled for {date} at {time}.',
          cancellation: 'Your appointment for {date} at {time} has been cancelled.',
          rescheduling: 'Your appointment has been rescheduled to {date} at {time}.'
        }
      }
    });

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        reminderTiming: settings.reminderTiming as any,
        priorityLevels: settings.priorityLevels as any,
        workingHours: settings.workingHours as any,
        blackoutDates: settings.blackoutDates as any,
        customRules: settings.customRules as any,
        templates: settings.templates as any
      }
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 