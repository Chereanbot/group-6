import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { NotificationType } from "@prisma/client";
import { getAuthHeaders, checkLawyerAuth } from "@/lib/auth-utils";

const notificationSchema = z.object({
  preferences: z.array(z.object({
    type: z.nativeEnum(NotificationType),
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
  })),
});

export async function GET() {
  try {
    const headers = await getAuthHeaders();
    const authError = checkLawyerAuth(headers, "notification settings");
    if (authError) return authError;

    const preferences = await prisma.notificationPreference.findMany({
      where: { userId: headers.userId! },
    });

    // If no preferences exist, create default ones for all notification types
    if (preferences.length === 0) {
      const defaultPreferences = Object.values(NotificationType).map(type => ({
        userId: headers.userId!,
        type,
        email: true,
        sms: true,
        push: true,
        inApp: true,
      }));

      await prisma.notificationPreference.createMany({
        data: defaultPreferences,
      });

      return NextResponse.json({ preferences: defaultPreferences });
    }

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("[NOTIFICATION_PREFERENCES_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const headers = await getAuthHeaders();
    const authError = checkLawyerAuth(headers, "notification settings");
    if (authError) return authError;

    const body = await request.json();
    const { preferences } = notificationSchema.parse(body);

    // Update preferences in a transaction
    await prisma.$transaction(
      preferences.map(pref => 
        prisma.notificationPreference.upsert({
          where: {
            userId_type: {
              userId: headers.userId!,
              type: pref.type,
            },
          },
          create: {
            userId: headers.userId!,
            type: pref.type,
            email: pref.email,
            sms: pref.sms,
            push: pref.push,
            inApp: pref.inApp,
          },
          update: {
            email: pref.email,
            sms: pref.sms,
            push: pref.push,
            inApp: pref.inApp,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      preferences,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[NOTIFICATION_PREFERENCES_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 