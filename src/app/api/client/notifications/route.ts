import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum, NotificationType } from "@prisma/client";

export async function GET(request: Request): Promise<NextResponse> {
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

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const typeParam = url.searchParams.get('type')?.toUpperCase();
    const itemsPerPage = 10;

    // Validate notification type
    let type: NotificationType | undefined;
    if (typeParam && typeParam !== 'ALL') {
      if (Object.values(NotificationType).includes(typeParam as NotificationType)) {
        type = typeParam as NotificationType;
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid notification type" },
          { status: 400 }
        );
      }
    }

    // Build where clause
    const where = {
      userId: payload.id,
      ...(type ? { type } : {})
    };

    // Get total count for pagination
    const total = await prisma.notification.count({ where });
    const totalPages = Math.ceil(total / itemsPerPage);

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        status: true,
        createdAt: true,
        link: true
      }
    });

    return NextResponse.json({
      success: true,
      data: notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type.toLowerCase(),
        read: notification.status === 'READ',
        createdAt: notification.createdAt.toISOString(),
        link: notification.link
      })),
      page,
      totalPages,
      totalItems: total
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
} 