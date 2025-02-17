import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    } = body;

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        coordinatorId,
        scheduledTime: new Date(scheduledTime),
        duration,
        purpose,
        status,
        notes,
      },
      include: {
        client: true,
        coordinator: true,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
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
    } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledTime: new Date(scheduledTime),
        duration,
        purpose,
        status,
        notes,
      },
      include: {
        client: true,
        coordinator: true,
      },
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