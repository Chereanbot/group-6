import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";

const calendarSchema = z.object({
  workingHours: z.object({
    monday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    tuesday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    wednesday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    thursday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    friday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })),
    saturday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
    sunday: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
  }),
  meetingPreferences: z.object({
    defaultDuration: z.number().min(15).max(480), // in minutes
    bufferTime: z.number().min(0).max(60), // in minutes
    autoAccept: z.boolean(),
    defaultLocation: z.enum(['OFFICE', 'VIRTUAL', 'CLIENT_LOCATION']),
    virtualMeetingProvider: z.enum(['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS']).optional(),
  }),
  reminders: z.object({
    defaultReminder: z.number().min(5), // in minutes
    additionalReminders: z.array(z.number()),
    notificationMethods: z.array(z.enum(['EMAIL', 'SMS', 'PUSH'])),
  }),
  integrations: z.object({
    googleCalendar: z.boolean(),
    outlookCalendar: z.boolean(),
    appleCalendar: z.boolean(),
  }),
  availability: z.object({
    bookingWindow: z.object({
      min: z.number(), // in days
      max: z.number(), // in days
    }),
    unavailableDates: z.array(z.string()),
  }),
});

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId || userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const calendarSettings = await prisma.calendarSettings.findUnique({
      where: { userId },
      include: {
        workingHours: true,
        unavailableDates: true,
      },
    });

    if (!calendarSettings) {
      // Return default calendar settings
      return NextResponse.json({
        workingHours: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }],
        },
        meetingPreferences: {
          defaultDuration: 60,
          bufferTime: 15,
          autoAccept: false,
          defaultLocation: 'OFFICE',
        },
        reminders: {
          defaultReminder: 15,
          additionalReminders: [60, 1440], // 1 hour and 1 day
          notificationMethods: ['EMAIL', 'PUSH'],
        },
        integrations: {
          googleCalendar: false,
          outlookCalendar: false,
          appleCalendar: false,
        },
        availability: {
          bookingWindow: {
            min: 1,
            max: 30,
          },
          unavailableDates: [],
        },
      });
    }

    return NextResponse.json(calendarSettings);
  } catch (error) {
    console.error("[CALENDAR_SETTINGS_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId || userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = calendarSchema.parse(body);

    // Update calendar settings in a transaction
    const updatedSettings = await prisma.$transaction(async (prisma) => {
      // Update or create calendar settings
      const calendarSettings = await prisma.calendarSettings.upsert({
        where: { userId },
        create: {
          userId,
          defaultDuration: validatedData.meetingPreferences.defaultDuration,
          bufferTime: validatedData.meetingPreferences.bufferTime,
          autoAccept: validatedData.meetingPreferences.autoAccept,
          defaultLocation: validatedData.meetingPreferences.defaultLocation,
          virtualMeetingProvider: validatedData.meetingPreferences.virtualMeetingProvider,
          defaultReminder: validatedData.reminders.defaultReminder,
          additionalReminders: validatedData.reminders.additionalReminders,
          notificationMethods: validatedData.reminders.notificationMethods,
          googleCalendar: validatedData.integrations.googleCalendar,
          outlookCalendar: validatedData.integrations.outlookCalendar,
          appleCalendar: validatedData.integrations.appleCalendar,
          bookingWindowMin: validatedData.availability.bookingWindow.min,
          bookingWindowMax: validatedData.availability.bookingWindow.max,
        },
        update: {
          defaultDuration: validatedData.meetingPreferences.defaultDuration,
          bufferTime: validatedData.meetingPreferences.bufferTime,
          autoAccept: validatedData.meetingPreferences.autoAccept,
          defaultLocation: validatedData.meetingPreferences.defaultLocation,
          virtualMeetingProvider: validatedData.meetingPreferences.virtualMeetingProvider,
          defaultReminder: validatedData.reminders.defaultReminder,
          additionalReminders: validatedData.reminders.additionalReminders,
          notificationMethods: validatedData.reminders.notificationMethods,
          googleCalendar: validatedData.integrations.googleCalendar,
          outlookCalendar: validatedData.integrations.outlookCalendar,
          appleCalendar: validatedData.integrations.appleCalendar,
          bookingWindowMin: validatedData.availability.bookingWindow.min,
          bookingWindowMax: validatedData.availability.bookingWindow.max,
        },
      });

      // Update working hours
      await prisma.workingHours.deleteMany({
        where: { calendarSettingsId: calendarSettings.id },
      });

      for (const [day, hours] of Object.entries(validatedData.workingHours)) {
        if (hours && hours.length > 0) {
          await Promise.all(hours.map(hour =>
            prisma.workingHours.create({
              data: {
                calendarSettingsId: calendarSettings.id,
                dayOfWeek: day.toUpperCase(),
                startTime: hour.start,
                endTime: hour.end,
              },
            })
          ));
        }
      }

      // Update unavailable dates
      await prisma.unavailableDate.deleteMany({
        where: { calendarSettingsId: calendarSettings.id },
      });

      await Promise.all(validatedData.availability.unavailableDates.map(date =>
        prisma.unavailableDate.create({
          data: {
            calendarSettingsId: calendarSettings.id,
            date: new Date(date),
          },
        })
      ));

      return calendarSettings;
    });

    return NextResponse.json({
      message: "Calendar settings updated successfully",
      calendarSettings: updatedSettings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[CALENDAR_SETTINGS_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 