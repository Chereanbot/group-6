import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendApprovalNotifications } from '@/lib/notifications/requestApproval';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { notes, assignedLawyerId } = await request.json();

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update service request status
      const updatedRequest = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          assignedLawyerId,
          updatedAt: new Date()
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          package: {
            select: {
              name: true,
              serviceType: true
            }
          },
          assignedLawyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          }
        }
      });

      // Create approval record
      await tx.serviceActivity.create({
        data: {
          requestId: id,
          type: 'STATUS_UPDATE',
          description: `Service request approved${notes ? `: ${notes}` : ''}`,
          userId: updatedRequest.assignedLawyerId || updatedRequest.clientId
        }
      });

      // Send notifications
      await sendApprovalNotifications({
        requestId: id,
        clientId: updatedRequest.client.id,
        clientName: updatedRequest.client.fullName,
        clientEmail: updatedRequest.client.email,
        clientPhone: updatedRequest.client.phone || undefined,
        serviceType: updatedRequest.package.serviceType,
        packageName: updatedRequest.package.name,
        assignedLawyer: updatedRequest.assignedLawyer ? {
          name: updatedRequest.assignedLawyer.fullName,
          email: updatedRequest.assignedLawyer.email,
          phone: updatedRequest.assignedLawyer.phone || undefined
        } : undefined,
        nextSteps: [
          'Review your assigned lawyer\'s details',
          'Schedule an initial consultation',
          'Prepare any requested documents',
          'Complete your client profile'
        ]
      });

      return updatedRequest;
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error approving service request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to approve service request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 