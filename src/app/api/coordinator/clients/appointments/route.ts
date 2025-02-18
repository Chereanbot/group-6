import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { Prisma } from '@prisma/client';

// GET /api/coordinator/clients/appointments
export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = await headersList.get('authorization');
    const cookies = await headersList.get('cookie');
    
    const token = authHeader?.split(' ')[1] || 
                 cookies?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: { office: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        coordinator: {
          id: coordinator.id
        }
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            clientProfile: {
              select: {
                region: true,
                zone: true,
                wereda: true,
                kebele: true,
                caseType: true,
                caseCategory: true
              }
            }
          }
        },
        coordinator: true
      },
      orderBy: {
        scheduledTime: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: appointments.map(apt => ({
        id: apt.id,
        title: apt.purpose,
        start: apt.scheduledTime.toISOString(),
        end: new Date(new Date(apt.scheduledTime).getTime() + apt.duration * 60000).toISOString(),
        client: {
          id: apt.client.id,
          name: apt.client.fullName,
          fullName: apt.client.fullName,
          email: apt.client.email,
          phone: apt.client.phone,
          clientProfile: apt.client.clientProfile
        },
        scheduledTime: apt.scheduledTime.toISOString(),
        duration: apt.duration,
        purpose: apt.purpose,
        status: apt.status,
        notes: apt.notes,
        caseType: apt.caseType,
        venue: apt.venue,
        priority: apt.priority
      }))
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/coordinator/clients/appointments
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const token = await headersList.get('authorization')?.split(' ')[1] || 
                 await headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { clientId, scheduledTime, duration, purpose, status, notes, caseType, venue, priority } = body;

    // Create appointment with coordinator connection
    const appointment = await prisma.appointment.create({
      data: {
        client: {
          connect: { id: clientId }
        },
        coordinator: {
          connect: { id: coordinator.id }
        },
        scheduledTime: new Date(scheduledTime),
        duration,
        purpose,
        status,
        notes,
        caseType,
        venue,
        priority
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            clientProfile: {
              select: {
                region: true,
                zone: true,
                wereda: true,
                kebele: true,
                caseType: true,
                caseCategory: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: appointment.id,
        title: appointment.purpose,
        start: appointment.scheduledTime.toISOString(),
        end: new Date(new Date(appointment.scheduledTime).getTime() + appointment.duration * 60000).toISOString(),
        client: {
          id: appointment.client.id,
          name: appointment.client.fullName,
          fullName: appointment.client.fullName,
          email: appointment.client.email,
          phone: appointment.client.phone,
          clientProfile: appointment.client.clientProfile
        },
        scheduledTime: appointment.scheduledTime.toISOString(),
        duration: appointment.duration,
        purpose: appointment.purpose,
        status: appointment.status,
        notes: appointment.notes,
        caseType: appointment.caseType,
        venue: appointment.venue,
        priority: appointment.priority
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create appointment', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/coordinator/clients/appointments
export async function PATCH(request: Request) {
  try {
    const headersList = headers();
    const authHeader = (await headersList).get('authorization') ?? '';
    const cookies = (await headersList).get('cookie') ?? '';
    const token = authHeader.split(' ')[1] || 
                 cookies.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, status, notes } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Get coordinator
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Check if appointment exists and belongs to coordinator
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        coordinatorId: coordinator.id
      }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found or not authorized' },
        { status: 404 }
      );
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            clientProfile: {
              select: {
                region: true,
                zone: true,
                wereda: true,
                kebele: true,
                caseType: true,
                caseCategory: true
              }
            }
          }
        },
        coordinator: true
      }
    });

    return NextResponse.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}