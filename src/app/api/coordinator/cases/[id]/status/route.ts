import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, CaseStatus } from '@prisma/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const caseId = await Promise.resolve(params.id);

    // Get auth token from headers or cookies
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

    // Check if user is a coordinator
    if (user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Only coordinators can update case status" },
        { status: 200 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: user.id },
      select: { officeId: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: "Coordinator profile not found" },
        { status: 404 }
      );
    }

    // Get the case
    const case_ = await prisma.case.findUnique({
      where: { id: caseId },
      select: { 
        id: true,
        status: true,
        officeId: true,
        title: true
      }
    });

    if (!case_) {
      return NextResponse.json(
        { success: false, message: "Case not found" },
        { status: 404 }
      );
    }

    // Verify the case belongs to coordinator's office
    if (case_.officeId !== coordinator.officeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Case does not belong to your office" },
        { status: 200 }
      );
    }

    // Get the new status from request body
    const { status } = await request.json();

    // Validate status
    if (!Object.values(CaseStatus).includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update the case status
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: { status },
      select: {
        id: true,
        status: true,
        title: true
      }
    });

    // Create case activity
    await prisma.caseActivity.create({
      data: {
        caseId: caseId,
        userId: user.id,
        title: 'Status Updated',
        description: `Case status updated from ${case_.status} to ${status} by coordinator ${user.fullName}`,
        type: 'STATUS_CHANGE'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Case status updated successfully',
      data: updatedCase
    });

  } catch (error) {
    console.error('Error updating case status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update case status'
      },
      { status: 500 }
    );
  }
} 