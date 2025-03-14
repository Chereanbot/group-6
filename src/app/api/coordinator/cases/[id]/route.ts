import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET(
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
        { success: false, message: "Unauthorized: Only coordinators can view case details" },
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

    // Fetch case details with related data
    const caseData = await prisma.case.findFirst({
      where: {
        id: params.id,
        officeId: coordinator.officeId
      },
      include: {
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        assignedOffice: {
          select: {
            name: true
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                fullName: true
              }
            }
          }
        },
        notes: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            creator: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found or not in your office' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: caseData
    });

  } catch (error) {
    console.error('Error fetching case details:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 