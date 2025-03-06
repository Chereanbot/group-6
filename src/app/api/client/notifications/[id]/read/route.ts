import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update notification status
    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: payload.id
      },
      data: {
        status: 'READ'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        status: notification.status
      }
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
} 