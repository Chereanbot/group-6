import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, CaseStatus } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please login first" },
        { status: 401 }
      );
    }

    // Verify authentication and check coordinator role
    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is a coordinator
    if (user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Only coordinators can update case status" },
        { status: 403 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findFirst({
      where: { userId: user.id },
      select: { officeId: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator profile not found' },
        { status: 404 }
      );
    }

    const data = await request.json();
    const { status } = data;

    if (!status || !Object.values(CaseStatus).includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Verify the case belongs to coordinator's office
    const existingCase = await prisma.case.findFirst({
      where: {
        id: params.id,
        officeId: coordinator.officeId
      }
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, message: 'Case not found or not in your office' },
        { status: 404 }
      );
    }

    // Update the case status
    const updatedCase = await prisma.case.update({
      where: { id: params.id },
      data: {
        status: status as CaseStatus,
        activities: {
          create: {
            title: 'Status Updated',
            type: 'STATUS_CHANGED',
            description: `Case status changed to ${status}`,
            user: {
              connect: { id: user.id }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCase
    });

  } catch (error) {
    console.error('Error updating case status:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 