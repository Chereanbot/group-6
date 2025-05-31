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
  { params }: { params: { id: string } }
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
    const { status, requestDetails } = body;
    const requestId = await params.id;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get the current request to check its status
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
      },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update the request status
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status,
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
      },
    });

    // Create an activity log
    await prisma.activity.create({
      data: {
        userId: adminCheck.authResult.user.id,
        action: 'UPDATE_SERVICE_REQUEST_STATUS',
        details: {
          requestId: requestId,
          oldStatus: currentRequest.status,
          newStatus: status,
          clientId: currentRequest.client.id,
        },
      },
    });

    // Send notification to client
    try {
      await notificationService.create({
        userId: currentRequest.client.id,
        title: `Service Request ${status}`,
        message: `Your service request "${requestDetails?.title || 'Service Request'}" has been ${status.toLowerCase()}.`,
        type: status === 'APPROVED' ? NotificationType.SERVICE_REQUEST : NotificationType.STATUS_UPDATE,
        priority: NotificationPriority.HIGH,
        link: `/client/services/requests/${requestId}`,
        metadata: {
          requestId: requestId,
          status: status,
          packageName: requestDetails?.packageName
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating service request status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 