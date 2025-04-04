import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createHistoryEntry } from '@/lib/history-utils';
import { Prisma } from '@prisma/client';

// GET all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        coordinator: true,
      },
      orderBy: {
        scheduledTime: 'desc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST new appointment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientId,
      coordinatorId,
      scheduledTime,
      duration,
      purpose,
      status = 'SCHEDULED',
      notes,
      caseType = 'CONSULTATION', // Default case type if not provided
    } = body;

    const appointmentData: Prisma.AppointmentCreateInput = {
      scheduledTime: new Date(scheduledTime),
      duration: Number(duration),
      purpose,
      status,
      notes,
      caseType,
      client: {
        connect: { id: clientId }
      },
      coordinator: {
        connect: { id: coordinatorId }
      }
    };

    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        client: true,
        coordinator: true,
      },
    });

    // Create history entry for the appointment
    await createHistoryEntry({
      action: 'APPOINTMENT_SCHEDULED',
      coordinatorId,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      changeDetails: `Scheduled ${caseType.toLowerCase()} appointment with ${appointment.client.fullName} for ${new Date(scheduledTime).toLocaleString()}`,
      previousValue: null,
      newValue: {
        scheduledTime,
        duration,
        purpose,
        status,
        caseType
      }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Appointment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// PUT update appointment
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      scheduledTime,
      duration,
      purpose,
      status,
      notes,
      caseType,
    } = body;

    const previousAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        coordinator: true,
      },
    });

    if (!previousAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointmentData: Prisma.AppointmentUpdateInput = {
      scheduledTime: new Date(scheduledTime),
      duration: Number(duration),
      purpose,
      status,
      notes,
      ...(caseType && { caseType }),
    };

    const appointment = await prisma.appointment.update({
      where: { id },
      data: appointmentData,
      include: {
        client: true,
        coordinator: true,
      },
    });

    // Create history entry for appointment update
    await createHistoryEntry({
      action: status === 'CANCELLED' ? 'APPOINTMENT_CANCELLED' : 'APPOINTMENT_UPDATED',
      coordinatorId: appointment.coordinatorId,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      changeDetails: `${status === 'CANCELLED' ? 'Cancelled' : 'Updated'} appointment with ${appointment.client.fullName}`,
      previousValue: {
        scheduledTime: previousAppointment.scheduledTime,
        duration: previousAppointment.duration,
        purpose: previousAppointment.purpose,
        status: previousAppointment.status,
        caseType: previousAppointment.caseType
      },
      newValue: {
        scheduledTime,
        duration,
        purpose,
        status,
        caseType: caseType || previousAppointment.caseType
      }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE appointment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        coordinator: true,
      },
    });

    if (appointment) {
      await createHistoryEntry({
        action: 'APPOINTMENT_CANCELLED',
        coordinatorId: appointment.coordinatorId,
        appointmentId: appointment.id,
        clientId: appointment.clientId,
        changeDetails: `Deleted ${appointment.caseType.toLowerCase()} appointment with ${appointment.client.fullName}`,
        previousValue: {
          scheduledTime: appointment.scheduledTime,
          duration: appointment.duration,
          purpose: appointment.purpose,
          status: appointment.status,
          caseType: appointment.caseType
        },
        newValue: null
      });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 