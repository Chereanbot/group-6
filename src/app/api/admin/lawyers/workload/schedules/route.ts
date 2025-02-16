import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const lawyerId = searchParams.get('lawyerId');

    const schedules = await prisma.workSchedule.findMany({
      where: {
        ...(lawyerId && { lawyerId }),
        ...(startDate && {
          date: {
            gte: new Date(startDate),
          },
        }),
        ...(endDate && {
          date: {
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const transformedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      lawyerId: schedule.lawyerId,
      lawyer: {
        name: schedule.lawyer.name,
        email: schedule.lawyer.email,
      },
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
      type: schedule.type,
      recurrence: schedule.recurrence,
      isAvailable: schedule.isAvailable,
      reason: schedule.reason,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    }));

    return NextResponse.json(transformedSchedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
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
    const {
      lawyerId,
      assignmentId,
      title,
      description,
      startTime,
      endTime,
      recurrence,
      recurrenceEndDate,
    } = body;

    // Validate required fields
    if (!lawyerId || !title || !startTime || !endTime) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check if lawyer exists
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      return new NextResponse('Lawyer not found', { status: 404 });
    }

    // Check if assignment exists if provided
    if (assignmentId) {
      const assignment = await prisma.workAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        return new NextResponse('Assignment not found', { status: 404 });
      }
    }

    // Check for schedule conflicts
    const conflictingSchedules = await prisma.workSchedule.findMany({
      where: {
        lawyerId,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (conflictingSchedules.length > 0) {
      return new NextResponse('Schedule conflicts with existing events', { status: 409 });
    }

    // Create new schedule
    const schedule = await prisma.workSchedule.create({
      data: {
        lawyer: {
          connect: { id: lawyerId },
        },
        ...(assignmentId && {
          assignment: {
            connect: { id: assignmentId },
          },
        }),
        title,
        description: description || '',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'SCHEDULED',
        recurrence: recurrence || 'NONE',
        ...(recurrenceEndDate && {
          recurrenceEndDate: new Date(recurrenceEndDate),
        }),
      },
      include: {
        lawyer: {
          include: {
            profile: true,
          },
        },
        assignment: {
          include: {
            case: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: schedule,
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 