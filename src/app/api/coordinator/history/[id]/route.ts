import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 200 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: user.id },
      include: { user: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    const historyEntry = await prisma.coordinatorHistory.findUnique({
      where: { id: params.id },
      include: {
        coordinator: true,
        client: true,
        case: true,
        lawyer: true,
        office: true,
        document: true,
        appointment: true,
        serviceRequest: true
      }
    });

    if (!historyEntry) {
      return NextResponse.json(
        { success: false, message: 'History entry not found' },
        { status: 404 }
      );
    }

    // Check if the coordinator has access to this history entry
    if (historyEntry.coordinatorId !== coordinator.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Format the response data
    const formattedEntry = {
      id: historyEntry.id,
      action: historyEntry.action,
      changeDetails: historyEntry.changeDetails,
      previousValue: historyEntry.previousValue,
      newValue: historyEntry.newValue,
      context: historyEntry.context,
      metadata: historyEntry.metadata,
      changedAt: historyEntry.changedAt.toISOString(),
      createdAt: historyEntry.createdAt.toISOString(),
      updatedAt: historyEntry.updatedAt.toISOString(),
      coordinatorId: historyEntry.coordinatorId,
      clientId: historyEntry.clientId,
      caseId: historyEntry.caseId,
      lawyerId: historyEntry.lawyerId,
      officeId: historyEntry.officeId,
      documentId: historyEntry.documentId,
      appointmentId: historyEntry.appointmentId,
      serviceRequestId: historyEntry.serviceRequestId,
      changedBy: historyEntry.changedBy,
      // Include related entities if they exist
      ...(historyEntry.client && { client: historyEntry.client }),
      ...(historyEntry.case && { case: historyEntry.case }),
      ...(historyEntry.lawyer && { lawyer: historyEntry.lawyer }),
      ...(historyEntry.office && { office: historyEntry.office }),
      ...(historyEntry.document && { document: historyEntry.document }),
      ...(historyEntry.appointment && { appointment: historyEntry.appointment }),
      ...(historyEntry.serviceRequest && { serviceRequest: historyEntry.serviceRequest })
    };

    return NextResponse.json({
      success: true,
      data: {
        history: formattedEntry
      }
    });

  } catch (error) {
    console.error('Error fetching history entry:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 