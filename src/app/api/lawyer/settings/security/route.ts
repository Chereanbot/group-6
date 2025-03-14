import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getAuthHeaders, checkLawyerAuth } from "@/lib/auth-utils";

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  twoFactorEnabled: z.boolean(),
  sessionTimeout: z.number().min(5).max(1440),
});

export async function GET() {
  try {
    const headers = await getAuthHeaders();
    const authError = checkLawyerAuth(headers, "security settings");
    if (authError) return authError;

    // Get active sessions
    const sessions = await prisma.session.findMany({
      where: {
        userId: headers.userId!,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userAgent: true,
        lastIpAddress: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get security logs
    const securityLogs = await prisma.securityLog.findMany({
      where: {
        userId: headers.userId!,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 10, // Get last 10 security events
      select: {
        eventType: true,
        description: true,
        ipAddress: true,
        timestamp: true,
        severity: true,
        status: true,
      },
    });

    return NextResponse.json({
      sessions,
      securityLogs,
    });
  } catch (error) {
    console.error("Error in security settings GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const headers = await getAuthHeaders();
    const authError = checkLawyerAuth(headers, "security settings");
    if (authError) return authError;

    const body = await request.json();
    const validatedData = securitySchema.parse(body);

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Verify current password
      const user = await tx.user.findUnique({
        where: { id: headers.userId! },
        select: { password: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const passwordValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      );

      if (!passwordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      // Update user password
      await tx.user.update({
        where: { id: headers.userId! },
        data: { password: hashedPassword },
      });

      // Log the security event
      await tx.securityLog.create({
        data: {
          userId: headers.userId!,
          eventType: "PASSWORD_CHANGE",
          severity: "HIGH",
          description: "Password changed successfully",
          ipAddress: headers.ipAddress,
          status: "SUCCESS",
          details: {
            userAgent: headers.userAgent,
            timestamp: new Date(),
          },
        },
      });

      // Update session timeout for all active sessions
      await tx.session.updateMany({
        where: {
          userId: headers.userId!,
          active: true,
        },
        data: {
          expiresAt: new Date(Date.now() + validatedData.sessionTimeout * 60000),
        },
      });

      return { success: true };
    });

    return NextResponse.json({
      message: "Security settings updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in security settings PUT:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 