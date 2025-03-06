import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum } from "@prisma/client";

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

    // Get next upcoming appointment
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        clientId: payload.id,
        scheduledTime: {
          gte: new Date()
        },
        status: 'SCHEDULED'
      },
      orderBy: {
        scheduledTime: 'asc'
      },
      select: {
        id: true,
        scheduledTime: true,
        purpose: true,
        venue: true,
        status: true,
        coordinator: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!nextAppointment) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: nextAppointment.id,
        datetime: nextAppointment.scheduledTime,
        purpose: nextAppointment.purpose,
        venue: nextAppointment.venue,
        status: nextAppointment.status,
        lawyerName: nextAppointment.coordinator?.fullName || 'Not assigned',
        lawyerEmail: nextAppointment.coordinator?.email,
        lawyerPhone: nextAppointment.coordinator?.phone
      }
    });
  } catch (error) {
    console.error("Error fetching next appointment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch next appointment" },
      { status: 500 }
    );
  }
} 