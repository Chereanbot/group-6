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

    // Get all relevant events for the client
    const [cases, appointments, payments, documents, notifications] = await Promise.all([
      // Get case updates
      prisma.case.findMany({
        where: { clientId: payload.id },
        select: {
          id: true,
          title: true,
          status: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      }),
      // Get appointments
      prisma.appointment.findMany({
        where: { clientId: payload.id },
        select: {
          id: true,
          purpose: true,
          status: true,
          scheduledTime: true,
          createdAt: true,
          venue: true
        },
        orderBy: { scheduledTime: 'desc' }
      }),
      // Get payments
      prisma.payment.findMany({
        where: {
          serviceRequest: {
            clientId: payload.id
          }
        },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          method: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      // Get documents
      prisma.document.findMany({
        where: {
          uploadedBy: payload.id
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          path: true,
          description: true,
          type: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      // Get notifications
      prisma.notification.findMany({
        where: { userId: payload.id },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Transform and combine all events
    const events = [
      // Case events
      ...cases.map(c => ({
        id: `case-${c.id}`,
        title: c.title,
        description: c.description || 'Case status updated',
        type: 'CASE_UPDATE' as const,
        status: c.status === 'ACTIVE' ? 'IN_PROGRESS' as const :
               c.status === 'RESOLVED' ? 'COMPLETED' as const :
               c.status === 'CANCELLED' ? 'CANCELLED' as const : 'PENDING' as const,
        date: c.updatedAt.toISOString(),
        metadata: {
          caseId: c.id
        }
      })),
      // Appointment events
      ...appointments.map(a => ({
        id: `appointment-${a.id}`,
        title: a.purpose,
        description: `Appointment ${a.status.toLowerCase()} at ${a.venue}`,
        type: 'APPOINTMENT' as const,
        status: a.status === 'SCHEDULED' ? 'PENDING' as const :
               a.status === 'COMPLETED' ? 'COMPLETED' as const :
               a.status === 'CANCELLED' ? 'CANCELLED' as const : 'IN_PROGRESS' as const,
        date: a.scheduledTime.toISOString(),
        metadata: {
          appointmentId: a.id
        }
      })),
      // Payment events
      ...payments.map(p => ({
        id: `payment-${p.id}`,
        title: `Payment of ${p.amount.toLocaleString()} ETB`,
        description: `Payment ${p.status.toLowerCase()} via ${p.method.toLowerCase()}`,
        type: 'PAYMENT' as const,
        status: p.status === 'COMPLETED' ? 'COMPLETED' as const :
               p.status === 'PENDING' ? 'PENDING' as const :
               p.status === 'FAILED' ? 'CANCELLED' as const : 'IN_PROGRESS' as const,
        date: p.createdAt.toISOString(),
        metadata: {
          amount: p.amount,
          paymentId: p.id
        }
      })),
      // Document events
      ...documents.map(d => ({
        id: `document-${d.id}`,
        title: d.title,
        description: d.description || `Document ${d.status.toLowerCase()}`,
        type: 'DOCUMENT' as const,
        status: d.status === 'APPROVED' ? 'COMPLETED' as const :
               d.status === 'PENDING' ? 'PENDING' as const :
               d.status === 'REJECTED' ? 'CANCELLED' as const : 'IN_PROGRESS' as const,
        date: d.createdAt.toISOString(),
        metadata: {
          documentUrl: d.path,
          documentType: d.type
        }
      })),
      // Message events
      ...notifications.map(n => ({
        id: `notification-${n.id}`,
        title: n.title,
        description: n.message,
        type: 'MESSAGE' as const,
        status: n.status === 'READ' ? 'COMPLETED' as const : 'PENDING' as const,
        date: n.createdAt.toISOString()
      }))
    ];

    // Sort all events by date
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch timeline events" },
      { status: 500 }
    );
  }
} 