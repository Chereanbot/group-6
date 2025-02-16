import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const assignments = await prisma.workAssignment.findMany({
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        case: {
          select: {
            id: true,
            title: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      lawyerId: assignment.lawyerId,
      lawyer: {
        name: assignment.lawyer.name,
        email: assignment.lawyer.email,
      },
      title: assignment.title,
      description: assignment.description,
      priority: assignment.priority,
      status: assignment.status,
      type: assignment.type,
      estimatedHours: assignment.estimatedHours,
      actualHours: assignment.actualHours,
      complexity: assignment.complexity,
      startDate: assignment.startDate,
      dueDate: assignment.dueDate,
      completedDate: assignment.completedDate,
      caseId: assignment.caseId,
      case: assignment.case ? {
        title: assignment.case.title,
        clientName: assignment.case.client.name,
      } : undefined,
      progress: assignment.progress,
      notes: assignment.notes,
      blockers: assignment.blockers,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
    }));

    return NextResponse.json(transformedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { lawyerId, caseId, priority, complexity, notes } = body;

    // Validate required fields
    if (!lawyerId || !caseId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if lawyer exists
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      return new NextResponse('Lawyer not found', { status: 404 });
    }

    // Check if case exists
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseRecord) {
      return new NextResponse('Case not found', { status: 404 });
    }

    // Create new assignment
    const assignment = await prisma.workAssignment.create({
      data: {
        lawyer: {
          connect: { id: lawyerId },
        },
        case: {
          connect: { id: caseId },
        },
        priority: priority || 'MEDIUM',
        complexity: complexity || 'MODERATE',
        notes: notes || '',
        status: 'PENDING',
        assignedAt: new Date(),
      },
      include: {
        lawyer: {
          include: {
            profile: true,
          },
        },
        case: true,
      },
    });

    return NextResponse.json({
      data: assignment,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 