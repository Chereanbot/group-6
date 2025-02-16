import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    // Fetch all cases
    const cases = await prisma.case.findMany({
      include: {
        assignedLawyer: {
          include: {
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
        client: true,
        assignments: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch all active lawyers
    const lawyers = await prisma.user.findMany({
      where: {
        userRole: 'LAWYER',
        status: 'ACTIVE'
      },
      include: {
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
    });

    // Fetch all active coordinators
    const coordinators = await prisma.user.findMany({
      where: {
        userRole: 'COORDINATOR',
        status: 'ACTIVE'
      },
      include: {
        coordinatorProfile: {
          include: {
            office: true,
            qualifications: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        cases,
        lawyers,
        coordinators
      }
    });

  } catch (error) {
    console.error('Error fetching assignment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment data' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { caseId, assigneeId, assigneeType, notes } = body;

    if (!caseId || !assigneeId || !assigneeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update case with new assignment
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        lawyerId: assigneeType === 'lawyer' ? assigneeId : undefined,
        assignmentNotes: notes,
        assignmentDate: new Date(),
        status: 'PENDING'
      },
      include: {
        assignedLawyer: true,
        client: true
      }
    });

    // Create assignment record
    await prisma.caseAssignment.create({
      data: {
        caseId,
        assignedById: assigneeId,
        assignedToId: assigneeId,
        status: 'PENDING',
        notes
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCase
    });

  } catch (error) {
    console.error('Error assigning case:', error);
    return NextResponse.json(
      { error: 'Failed to assign case' },
      { status: 500 }
    );
  }
} 