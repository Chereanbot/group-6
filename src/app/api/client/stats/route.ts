import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum, CaseStatus } from "@prisma/client";

export async function GET(): Promise<NextResponse> {
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

    // Get client statistics
    const [
      activeCases,
      upcomingAppointments,
      pendingPayments,
      unreadMessages,
      previousMonthCases,
      previousMonthAppointments,
      previousMonthMessages
    ] = await Promise.all([
      // Active cases count
      prisma.case.count({
        where: {
          clientId: payload.id,
          status: {
            notIn: [CaseStatus.RESOLVED, CaseStatus.CANCELLED]
          }
        }
      }),
      // Upcoming appointments count
      prisma.appointment.count({
        where: {
          clientId: payload.id,
          scheduledTime: {
            gte: new Date()
          },
          status: 'SCHEDULED'
        }
      }),
      // Pending payments count
      prisma.payment.count({
        where: {
          serviceRequest: {
            clientId: payload.id
          },
          status: 'PENDING'
        }
      }),
      // Unread messages count
      prisma.notification.count({
        where: {
          userId: payload.id,
          status: 'UNREAD'
        }
      }),
      // Previous month cases count
      prisma.case.count({
        where: {
          clientId: payload.id,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      }),
      // Previous month appointments count
      prisma.appointment.count({
        where: {
          clientId: payload.id,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      }),
      // Previous month messages count
      prisma.notification.count({
        where: {
          userId: payload.id,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      })
    ]);

    // Calculate percentage changes
    const casesChange = previousMonthCases ? ((activeCases - previousMonthCases) / previousMonthCases) * 100 : 0;
    const appointmentsChange = previousMonthAppointments ? ((upcomingAppointments - previousMonthAppointments) / previousMonthAppointments) * 100 : 0;
    const messagesChange = previousMonthMessages ? ((unreadMessages - previousMonthMessages) / previousMonthMessages) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        activeCases,
        upcomingAppointments,
        pendingPayments,
        unreadMessages,
        casesChange: Math.round(casesChange),
        appointmentsChange: Math.round(appointmentsChange),
        messagesChange: Math.round(messagesChange)
      }
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
} 