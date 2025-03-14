import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";

const preferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.enum(['12H', '24H']),
  accessibility: z.object({
    highContrast: z.boolean(),
    fontSize: z.number().min(12).max(24),
    reducedMotion: z.boolean(),
    screenReader: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['PUBLIC', 'PRIVATE', 'CONTACTS_ONLY']),
    showOnlineStatus: z.boolean(),
    showLastSeen: z.boolean(),
    allowMessages: z.boolean(),
  }),
  defaultView: z.object({
    calendar: z.enum(['MONTH', 'WEEK', 'DAY', 'AGENDA']),
    startOfWeek: z.enum(['SUNDAY', 'MONDAY']),
    casesDisplay: z.enum(['LIST', 'GRID', 'KANBAN']),
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

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences
      return NextResponse.json({
        theme: 'SYSTEM',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24H',
        accessibility: {
          highContrast: false,
          fontSize: 16,
          reducedMotion: false,
          screenReader: false,
        },
        privacy: {
          profileVisibility: 'PUBLIC',
          showOnlineStatus: true,
          showLastSeen: true,
          allowMessages: true,
        },
        defaultView: {
          calendar: 'MONTH',
          startOfWeek: 'MONDAY',
          casesDisplay: 'LIST',
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("[PREFERENCES_GET]", error);
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
    const validatedData = preferencesSchema.parse(body);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...validatedData,
      },
      update: validatedData,
    });

    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[PREFERENCES_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 