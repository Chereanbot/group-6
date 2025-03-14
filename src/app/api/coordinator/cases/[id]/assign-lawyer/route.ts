import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function POST(
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
        { success: false, message: "Unauthorized: Only coordinators can assign lawyers" },
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
    const { lawyerId } = data;

    if (!lawyerId) {
      return NextResponse.json(
        { success: false, message: 'Lawyer ID is required' },
        { status: 400 }
      );
    }

    // Verify the lawyer exists and belongs to the same office
    const lawyer = await prisma.user.findFirst({
      where: {
        id: lawyerId,
        userRole: UserRoleEnum.LAWYER,
        lawyerProfile: {
          officeId: coordinator.officeId
        }
      },
      include: {
        lawyerProfile: true
      }
    });

    if (!lawyer) {
      return NextResponse.json(
        { success: false, message: 'Lawyer not found or not in your office' },
        { status: 404 }
      );
    }

    // Create case assignment
    const assignment = await prisma.caseAssignment.create({
      data: {
        assignedBy: {
          connect: { id: user.id }
        },
        assignedTo: {
          connect: { id: lawyerId }
        },
        case: {
          connect: { id: params.id }
        },
        status: 'PENDING',
        createdAt: new Date()
      }
    });

    // Update the case with assignment
    const updatedCase = await prisma.case.update({
      where: { id: params.id },
      data: {
        assignedLawyer: {
          connect: { id: lawyerId }
        },
        activities: {
          create: {
            title: 'Lawyer Assigned',
            type: 'ASSIGNED',
            description: `Case assigned to lawyer ${lawyer.fullName}`,
            user: {
              connect: { id: user.id }
            }
          }
        }
      },
      include: {
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            lawyerProfile: {
              select: {
                specializations: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        case: updatedCase,
        assignment
      }
    });

  } catch (error) {
    console.error('Error assigning lawyer:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 