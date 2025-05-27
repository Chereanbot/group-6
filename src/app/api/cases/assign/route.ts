import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, CaseStatus, AssignmentStatus, Prisma } from '@prisma/client';

// GET - Fetch assignable cases and available lawyers
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const officeId = searchParams.get('office');
    const specialization = searchParams.get('specialization');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause for cases
    const whereClause: Prisma.CaseWhereInput = {
      OR: [
        { lawyerId: null },
        { status: CaseStatus.PENDING }
      ],
      ...(status ? { status: status as CaseStatus } : {}),
      ...(officeId ? { assignedOffice: { id: officeId } } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { clientName: { contains: search, mode: 'insensitive' } },
          { clientPhone: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };

    // Fetch unassigned or reassignable cases
    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            lawyerProfile: {
              include: {
                office: true,
                specializations: {
                  include: {
                    specialization: true
                  }
                }
              }
            }
          }
        },
        assignedOffice: true,
        documents: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        activities: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch available lawyers with their current workload
    const lawyers = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.LAWYER,
        status: 'ACTIVE',
        lawyerProfile: {
          office: officeId ? { id: officeId } : undefined,
          specializations: specialization ? {
            some: {
              specialization: {
                name: specialization
              }
            }
          } : undefined
        }
      },
      include: {
        lawyerProfile: {
          include: {
            office: true,
            specializations: {
              include: {
                specialization: true
              }
            }
          }
        },
        assignedCases: {
          where: {
            status: {
              in: [CaseStatus.ACTIVE, CaseStatus.PENDING]
            }
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    // Fetch offices for filtering
    const offices = await prisma.office.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        location: true
      }
    });

    // Fetch specializations for filtering
    const specializations = await prisma.legalSpecialization.findMany({
      select: {
        id: true,
        name: true,
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        cases,
        lawyers,
        offices,
        specializations
      }
    });

  } catch (error) {
    console.error('Error fetching assignable cases:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch assignable cases',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Assign or reassign a case
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { caseId, lawyerId, notes } = data;

    if (!caseId || !lawyerId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if lawyer exists and is available
    const lawyer = await prisma.user.findUnique({
      where: { id: lawyerId },
      include: {
        lawyerProfile: true,
        assignedCases: {
          where: {
            status: {
              in: [CaseStatus.ACTIVE, CaseStatus.PENDING]
            }
          }
        }
      }
    });

    if (!lawyer || !lawyer.lawyerProfile) {
      return NextResponse.json(
        { success: false, message: "Lawyer not found or not available" },
        { status: 404 }
      );
    }

    // Check lawyer's current caseload
    if (lawyer.assignedCases.length >= (lawyer.lawyerProfile.caseLoad + 5)) {
      return NextResponse.json(
        { success: false, message: "Lawyer has reached maximum caseload" },
        { status: 400 }
      );
    }

    // Perform the assignment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the case
      const updatedCase = await tx.case.update({
        where: { id: caseId },
        data: {
          lawyerId,
          status: CaseStatus.ACTIVE,
          assignmentDate: new Date(),
          assignmentNotes: notes
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          assignedLawyer: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // Create assignment record
      const assignment = await tx.caseAssignment.create({
        data: {
          caseId,
          assignedById: user.id,
          assignedToId: lawyerId,
          status: AssignmentStatus.ACCEPTED,
          notes
        }
      });

      // Update lawyer's caseload
      await tx.lawyerProfile.update({
        where: { userId: lawyerId },
        data: {
          caseLoad: {
            increment: 1
          }
        }
      });

      // Create activity log
      await tx.activity.create({
        data: {
          userId: user.id,
          action: 'CASE_ASSIGNMENT',
          details: {
            caseId,
            lawyerId,
            assignmentId: assignment.id
          } as Prisma.JsonObject
        }
      });

      return updatedCase;
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error assigning case:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to assign case',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 