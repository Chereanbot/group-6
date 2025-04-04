import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { Prisma } from '@prisma/client';
import { sendSMS, formatAppointmentMessage, sendEmail } from '@/lib/notifications';

// Appointment status enum
const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED'
} as const;

type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

interface AppointmentData {
  clientId: string;
  scheduledTime: string;
  duration: number;
  purpose: string;
  status?: AppointmentStatus;
  notes?: string;
  caseType: string;
  venue: string;
  priority?: string;
  requiredDocuments?: string[];
  reminderType?: string[];
  reminderTiming?: number[];
}

// Validation function for appointment data
const validateAppointmentData = (data: AppointmentData) => {
  const errors: string[] = [];
  
  if (!data.clientId) errors.push('Client ID is required');
  if (!data.scheduledTime) errors.push('Scheduled time is required');
  if (!data.duration || data.duration < 15) errors.push('Duration must be at least 15 minutes');
  if (!data.purpose) errors.push('Purpose is required');
  if (!data.caseType) errors.push('Case type is required');
  if (!data.venue) errors.push('Venue is required');
  
  return errors;
};

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.AppointmentWhereInput = {
      coordinatorId: payload.id
    };

    if (status) {
      where.status = status as any;
    }

    if (startDate && endDate) {
      where.scheduledTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
        coordinator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { scheduledTime: 'asc' },
        { status: 'asc' }
      ]
    });

    // Transform the appointments data for the response
    const formattedAppointments = appointments.map(apt => ({
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
      coordinator: {
        id: apt.coordinator.id,
        name: apt.coordinator.fullName,
        email: apt.coordinator.email,
        phone: apt.coordinator.phone
      },
      scheduledTime: apt.scheduledTime.toISOString(),
      duration: apt.duration,
      purpose: apt.purpose,
      status: apt.status,
      notes: apt.notes,
      caseType: apt.caseType,
      venue: apt.venue,
      priority: apt.priority,
      requiredDocuments: apt.requiredDocuments,
      reminderType: apt.reminderType,
      reminderTiming: apt.reminderTiming,
      cancellationReason: apt.cancellationReason,
      completionNotes: apt.completionNotes
    }));

    return NextResponse.json({
      success: true,
      data: formattedAppointments
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
    
    // Validate appointment data
    const validationErrors = validateAppointmentData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: validationErrors },
        { status: 400 }
      );
    }

    const { 
      clientId, 
      scheduledTime, 
      duration, 
      purpose, 
      status = APPOINTMENT_STATUS.SCHEDULED, 
      notes, 
      caseType, 
      venue, 
      priority,
      requiredDocuments,
      reminderType,
      reminderTiming
    } = body;

    // Check for scheduling conflicts
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        coordinatorId: coordinator.userId,
        scheduledTime: {
          gte: new Date(scheduledTime),
          lt: new Date(new Date(scheduledTime).getTime() + duration * 60000)
        },
        status: {
          notIn: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED]
        }
      }
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Time slot is already booked' },
        { status: 400 }
      );
    }

    // Get client details for notifications
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        phone: true,
        fullName: true,
        email: true
      }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Client not found' },
        { status: 404 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        client: {
          connect: { id: clientId }
        },
        coordinator: {
          connect: { id: coordinator.userId }
        },
        scheduledTime: new Date(scheduledTime),
        duration,
        purpose,
        status,
        notes,
        caseType,
        venue,
        priority,
        requiredDocuments,
        reminderType,
        reminderTiming
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

    // Send notifications
    const message = formatAppointmentMessage({
      scheduledTime,
      purpose,
      venue,
      duration,
      status
    });

    // Send SMS
    if (client.phone) {
      await sendSMS(client.phone, message);
    }

    // Send email
    if (client.email) {
      await sendEmail({
        to: client.email,
        subject: 'New Appointment Scheduled',
        html: `
          <h2>New Appointment Scheduled</h2>
          <p>Dear ${client.fullName},</p>
          <p>Your appointment has been scheduled with the following details:</p>
          <ul>
            <li>Date: ${new Date(scheduledTime).toLocaleDateString()}</li>
            <li>Time: ${new Date(scheduledTime).toLocaleTimeString()}</li>
            <li>Purpose: ${purpose}</li>
            <li>Venue: ${venue}</li>
            <li>Duration: ${duration} minutes</li>
          </ul>
        `
      });
    }

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
        priority: appointment.priority,
        requiredDocuments: appointment.requiredDocuments,
        reminderType: appointment.reminderType,
        reminderTiming: appointment.reminderTiming
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

// PATCH /api/coordinator/clients/appointments
export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { appointmentId, status, cancellationReason, completionNotes } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status transition
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true }
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if coordinator owns this appointment
    if (appointment.coordinatorId !== payload.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this appointment' },
        { status: 403 }
      );
    }

    // Validate status transition
    const validTransitions = {
      [APPOINTMENT_STATUS.SCHEDULED]: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CANCELLED],
      [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.NO_SHOW, APPOINTMENT_STATUS.CANCELLED],
      [APPOINTMENT_STATUS.RESCHEDULED]: [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.CANCELLED]
    };

    if (!validTransitions[appointment.status as keyof typeof validTransitions]?.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status transition' },
        { status: 400 }
      );
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status,
        ...(status === APPOINTMENT_STATUS.CANCELLED && { cancellationReason }),
        ...(status === APPOINTMENT_STATUS.COMPLETED && { completionNotes })
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Send notifications based on status change
    const message = formatAppointmentMessage({
      scheduledTime: updatedAppointment.scheduledTime,
      purpose: updatedAppointment.purpose,
      venue: updatedAppointment.venue,
      duration: updatedAppointment.duration,
      status: updatedAppointment.status,
      cancellationReason: updatedAppointment.cancellationReason
    });

    // Send SMS
    if (updatedAppointment.client.phone) {
      await sendSMS(updatedAppointment.client.phone, message);
    }

    // Send email
    if (updatedAppointment.client.email) {
      await sendEmail({
        to: updatedAppointment.client.email,
        subject: `Appointment ${status.toLowerCase()}`,
        html: `
          <h2>Appointment ${status}</h2>
          <p>Dear ${updatedAppointment.client.fullName},</p>
          <p>Your appointment has been ${status.toLowerCase()} with the following details:</p>
          <ul>
            <li>Date: ${new Date(updatedAppointment.scheduledTime).toLocaleDateString()}</li>
            <li>Time: ${new Date(updatedAppointment.scheduledTime).toLocaleTimeString()}</li>
            <li>Purpose: ${updatedAppointment.purpose}</li>
            <li>Status: ${status}</li>
            ${cancellationReason ? `<li>Cancellation Reason: ${cancellationReason}</li>` : ''}
            ${completionNotes ? `<li>Completion Notes: ${completionNotes}</li>` : ''}
          </ul>
        `
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/coordinator/clients/appointments
export async function DELETE(request: Request) {
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

    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true }
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if coordinator owns this appointment
    if (appointment.coordinatorId !== payload.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to delete this appointment' },
        { status: 403 }
      );
    }

    // Only allow deletion of future appointments
    if (new Date(appointment.scheduledTime) <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete past or current appointments' },
        { status: 400 }
      );
    }

    await prisma.appointment.delete({
      where: { id: appointmentId }
    });

    // Send notification about deletion
    if (appointment.client.phone) {
      await sendSMS(
        appointment.client.phone,
        `Your appointment scheduled for ${new Date(appointment.scheduledTime).toLocaleString()} has been deleted.`
      );
    }

    if (appointment.client.email) {
      await sendEmail({
        to: appointment.client.email,
        subject: 'Appointment Deleted',
        html: `
          <h2>Appointment Deleted</h2>
          <p>Dear ${appointment.client.fullName},</p>
          <p>Your appointment has been deleted with the following details:</p>
          <ul>
            <li>Date: ${new Date(appointment.scheduledTime).toLocaleDateString()}</li>
            <li>Time: ${new Date(appointment.scheduledTime).toLocaleTimeString()}</li>
            <li>Purpose: ${appointment.purpose}</li>
          </ul>
        `
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}