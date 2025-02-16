import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Get schedule with related data
    const schedule = await prisma.workSchedule.findUnique({
      where: { id },
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

    if (!schedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    return NextResponse.json({
      data: schedule,
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const {
      title,
      description,
      startTime,
      endTime,
      status,
      recurrence,
      recurrenceEndDate,
    } = body;

    // Get existing schedule
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    // Check for schedule conflicts if time is being updated
    if (startTime || endTime) {
      const newStartTime = startTime ? new Date(startTime) : existingSchedule.startTime;
      const newEndTime = endTime ? new Date(endTime) : existingSchedule.endTime;

      const conflictingSchedules = await prisma.workSchedule.findMany({
        where: {
          id: { not: id },
          lawyerId: existingSchedule.lawyerId,
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (conflictingSchedules.length > 0) {
        return new NextResponse('Schedule conflicts with existing events', { status: 409 });
      }
    }

    // Update schedule
    const schedule = await prisma.workSchedule.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(status && { status }),
        ...(recurrence && { recurrence }),
        ...(recurrenceEndDate && { recurrenceEndDate: new Date(recurrenceEndDate) }),
        updatedAt: new Date(),
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
    console.error('Error updating schedule:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Get existing schedule
    const existingSchedule = await prisma.workSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return new NextResponse('Schedule not found', { status: 404 });
    }

    // Delete schedule
    await prisma.workSchedule.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 