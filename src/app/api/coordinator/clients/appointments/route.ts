import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        coordinatorId: session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ensure we're returning an array
    if (!Array.isArray(appointments)) {
      console.error('Appointments is not an array:', appointments);
      return NextResponse.json([]);
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json([], { status: 500 }); // Return empty array on error
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId,
      scheduledTime,
      duration,
      purpose,
      priority = 'MEDIUM',
      caseType,
      caseDetails,
      venue,
      requiredDocuments = [],
      status = 'SCHEDULED',
      notes,
      serviceRequestId,
      reminderType = ['EMAIL'],
      reminderTiming = [24, 1],
    } = body;

    // Validate required fields
    if (!clientId || !scheduledTime || !duration || !purpose || !caseType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        AND: [
          { status: 'SCHEDULED' },
          {
            OR: [
              {
                AND: [
                  { coordinatorId: session.user.id },
                  {
                    scheduledTime: {
                      gte: new Date(scheduledTime),
                      lt: new Date(new Date(scheduledTime).getTime() + duration * 60000),
                    },
                  },
                ],
              },
              {
                AND: [
                  { clientId: clientId },
                  {
                    scheduledTime: {
                      gte: new Date(scheduledTime),
                      lt: new Date(new Date(scheduledTime).getTime() + duration * 60000),
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing appointment' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        coordinatorId: session.user.id,
        scheduledTime: new Date(scheduledTime),
        duration,
        purpose,
        priority,
        caseType,
        caseDetails,
        venue,
        requiredDocuments,
        status,
        notes,
        serviceRequestId,
        reminderType,
        reminderTiming,
      },
    });

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: clientId,
        title: 'New Appointment Scheduled',
        message: `New appointment scheduled for ${new Date(scheduledTime).toLocaleString()}`,
        type: 'APPOINTMENT',
        priority: priority === 'HIGH' || priority === 'URGENT' ? 'HIGH' : 'NORMAL',
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      scheduledTime,
      duration,
      purpose,
      priority,
      caseType,
      caseDetails,
      venue,
      requiredDocuments,
      status,
      notes,
      serviceRequestId,
      reminderType,
      reminderTiming,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Check for scheduling conflicts if time is being updated
    if (scheduledTime && duration) {
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { status: 'SCHEDULED' },
            { coordinatorId: session.user.id },
            {
              scheduledTime: {
                gte: new Date(scheduledTime),
                lt: new Date(new Date(scheduledTime).getTime() + duration * 60000),
              },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: 'Time slot conflicts with existing appointment' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      duration,
      purpose,
      priority,
      caseType,
      caseDetails,
      venue,
      requiredDocuments,
      status,
      notes,
      serviceRequestId,
      reminderType,
      reminderTiming,
    };

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    // Create notification for status updates
    if (status) {
      await prisma.notification.create({
        data: {
          userId: appointment.clientId,
          title: 'Appointment Status Updated',
          message: `Your appointment status has been updated to ${status}`,
          type: 'APPOINTMENT',
          priority: priority === 'HIGH' || priority === 'URGENT' ? 'HIGH' : 'NORMAL',
        },
      });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.delete({
      where: { id },
    });

    // Create cancellation notification
    await prisma.notification.create({
      data: {
        userId: appointment.clientId,
        title: 'Appointment Cancelled',
        message: `Your appointment scheduled for ${appointment.scheduledTime.toLocaleString()} has been cancelled`,
        type: 'APPOINTMENT',
        priority: 'HIGH',
      },
    });

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}