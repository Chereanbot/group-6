import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum, Prisma } from "@prisma/client";

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

    // Get all cases for the client with coordinator information
    const cases = await prisma.case.findMany({
      where: {
        clientId: payload.id
      },
      include: {
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            lawyerProfile: {
              include: {
                specializations: {
                  include: {
                    specialization: true
                  }
                }
              }
            }
          }
        },
        assignments: {
          where: {
            status: 'PENDING'
          },
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                coordinatorProfile: {
                  include: {
                    office: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        client: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        },
        caseEvents: true,
        documents: {
          include: {
            uploader: {
              select: {
                fullName: true
              }
            }
          }
        },
        activities: {
          include: {
            user: {
              select: {
                fullName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include coordinator information in the expected format
    const transformedCases = cases.map(case_ => {
      const latestAssignment = case_.assignments[0];
      const coordinator = latestAssignment?.assignedTo?.coordinatorProfile;
      
      return {
        ...case_,
        assignedCoordinator: latestAssignment ? {
          fullName: latestAssignment.assignedTo.fullName,
          email: latestAssignment.assignedTo.email,
          phone: latestAssignment.assignedTo.phone,
          coordinator: coordinator ? {
            type: coordinator.type,
            office: {
              name: coordinator.office.name,
              location: coordinator.office.location
            }
          } : undefined
        } : undefined,
        assignments: undefined // Remove the assignments array from the response
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedCases
    });
  } catch (error) {
    console.error("Error fetching client cases:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('id');

    if (!caseId) {
      return NextResponse.json(
        { success: false, message: "Case ID is required" },
        { status: 400 }
      );
    }

    // Check if the case exists and belongs to the client
    const case_ = await prisma.case.findFirst({
      where: {
        id: caseId,
        clientId: payload.id
      }
    });

    if (!case_) {
      return NextResponse.json(
        { success: false, message: "Case not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if the case can be deleted (e.g., not already in progress)
    if (case_.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: "Only pending cases can be deleted" },
        { status: 400 }
      );
    }

    // Delete related records first
    await prisma.$transaction([
      // Delete case documents
      prisma.caseDocument.deleteMany({
        where: { caseId }
      }),
      // Delete case activities
      prisma.caseActivity.deleteMany({
        where: { caseId }
      }),
      // Delete case assignments
      prisma.caseAssignment.deleteMany({
        where: { caseId }
      }),
      // Delete case notes
      prisma.caseNote.deleteMany({
        where: { caseId }
      }),
      // Delete case events
      prisma.event.deleteMany({
        where: { caseId }
      }),
      // Delete the case itself
      prisma.case.delete({
        where: { id: caseId }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: "Case deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete case" },
      { status: 500 }
    );
  }
} 