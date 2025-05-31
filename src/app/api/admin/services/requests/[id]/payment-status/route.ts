import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, NotificationType, NotificationPriority } from '@prisma/client';
import prisma from '@/lib/prisma';
import { notificationService } from '@/services/notification.service';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || authResult.user?.userRole !== UserRoleEnum.SUPER_ADMIN) {
    return { error: 'Unauthorized access', status: 403 };
  }

  return { authResult };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const { paymentStatus } = body;
    const { id: requestId } = await params;

    if (!paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'Payment status is required' },
        { status: 400 }
      );
    }

    // Get the current request
    const currentRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        package: true,
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update the request payment status
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        paymentStatus,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        package: true,
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Create an activity log
    await prisma.activity.create({
      data: {
        userId: adminCheck.authResult.user.id,
        action: 'UPDATE_PAYMENT_STATUS',
        details: {
          requestId: requestId,
          oldStatus: currentRequest.paymentStatus,
          newStatus: paymentStatus,
          clientId: currentRequest.client.id,
        },
      },
    });

    // Send notification to client
    try {
      await notificationService.create({
        userId: currentRequest.client.id,
        title: 'Payment Status Updated',
        message: `The payment status for your service request "${currentRequest.package.name}" has been updated to ${paymentStatus}.`,
        type: NotificationType.SERVICE_REQUEST,
        priority: NotificationPriority.HIGH,
        link: `/client/services/requests/${requestId}`,
        metadata: {
          requestId: requestId,
          packageName: currentRequest.package.name,
          paymentStatus: paymentStatus
        }
      });

      // Send notification to assigned lawyer if exists
      if (currentRequest.assignedLawyer) {
        await notificationService.create({
          userId: currentRequest.assignedLawyer.id,
          title: 'Payment Status Updated',
          message: `The payment status for service request "${currentRequest.package.name}" has been updated to ${paymentStatus}.`,
          type: NotificationType.SERVICE_REQUEST,
          priority: NotificationPriority.HIGH,
          link: `/lawyer/services/requests/${requestId}`,
          metadata: {
            requestId: requestId,
            packageName: currentRequest.package.name,
            paymentStatus: paymentStatus
          }
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 