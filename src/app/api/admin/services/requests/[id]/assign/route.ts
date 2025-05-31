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

// GET endpoint to fetch available lawyers
export async function GET(
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

    const requestId = await params.id;

    // Get the service request to check its current status
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        package: true,
      },
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      );
    }

    // Get all lawyers with their current case load
    const lawyers = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.LAWYER,
        status: 'ACTIVE',
        lawyerProfile: {
          availability: true,
        },
      },
      include: {
        lawyerProfile: {
          include: {
            specializations: {
              include: {
                specialization: true,
              },
            },
          },
        },
        assignedServices: {
          where: {
            status: {
              in: ['IN_PROGRESS', 'PENDING'],
            },
          },
        },
      },
    });

    // Calculate workload for each lawyer
    const availableLawyers = lawyers.map(lawyer => ({
      id: lawyer.id,
      fullName: lawyer.fullName,
      email: lawyer.email,
      phone: lawyer.phone,
      experience: lawyer.lawyerProfile?.experience || 0,
      rating: lawyer.lawyerProfile?.rating || 0,
      currentWorkload: lawyer.assignedServices.length,
      specializations: lawyer.lawyerProfile?.specializations.map(spec => ({
        name: spec.specialization.name,
        category: spec.specialization.category,
        yearsExperience: spec.yearsExperience,
      })) || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        serviceRequest,
        availableLawyers,
      },
    });
  } catch (error) {
    console.error('Error fetching available lawyers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to assign a lawyer
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
    const { lawyerId, assignmentNotes } = body;
    const requestId = await params.id;

    if (!lawyerId) {
      return NextResponse.json(
        { success: false, error: 'Lawyer ID is required' },
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
      },
    });

    if (!currentRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    // Get the assigned lawyer
    const lawyer = await prisma.user.findUnique({
      where: { id: lawyerId },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    if (!lawyer) {
      return NextResponse.json(
        { success: false, error: 'Lawyer not found' },
        { status: 404 }
      );
    }

    // Update the request with the assigned lawyer
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        assignedLawyerId: lawyerId,
        status: 'IN_PROGRESS',
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
      },
    });

    // Create an activity log
    await prisma.activity.create({
      data: {
        userId: adminCheck.authResult.user.id,
        action: 'ASSIGN_SERVICE_REQUEST',
        details: {
          requestId: requestId,
          lawyerId: lawyerId,
          clientId: currentRequest.client.id,
          assignmentNotes: assignmentNotes || undefined,
        },
      },
    });

    // Send notification to client
    try {
      await notificationService.create({
        userId: currentRequest.client.id,
        title: 'Lawyer Assigned',
        message: `A lawyer has been assigned to your service request "${currentRequest.package.name}".`,
        type: NotificationType.SERVICE_REQUEST,
        priority: NotificationPriority.HIGH,
        link: `/client/services/requests/${requestId}`,
        metadata: {
          requestId: requestId,
          lawyerId: lawyerId,
          packageName: currentRequest.package.name
        }
      });

      // Send notification to assigned lawyer
      await notificationService.create({
        userId: lawyerId,
        title: 'New Service Request Assignment',
        message: `You have been assigned to handle the service request "${currentRequest.package.name}".${assignmentNotes ? `\n\nNotes: ${assignmentNotes}` : ''}`,
        type: NotificationType.SERVICE_REQUEST,
        priority: NotificationPriority.HIGH,
        link: `/lawyer/services/requests/${requestId}`,
        metadata: {
          requestId: requestId,
          clientId: currentRequest.client.id,
          packageName: currentRequest.package.name
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
    console.error('Error assigning lawyer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 