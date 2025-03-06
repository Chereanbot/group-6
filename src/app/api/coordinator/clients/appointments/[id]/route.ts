import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { sendSMS, formatAppointmentMessage } from '@/lib/infobip';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const cookies = headersList.get('cookie');
    
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

    // Check if the appointment exists and belongs to the coordinator
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        coordinatorId: payload.id
      }
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found or not authorized' },
        { status: 404 }
      );
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: {
        id: params.id
      }
    });

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const cookies = headersList.get('cookie');
    
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

    const body = await request.json();
    const {
      scheduledTime,
      duration,
      purpose,
      status,
      notes,
      caseType,
      venue,
      priority,
      requiredDocuments
    } = body;

    // Check if the appointment exists and belongs to the coordinator
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        coordinatorId: payload.id
      },
      include: {
        client: {
          select: {
            phone: true,
            fullName: true
          }
        }
      }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found or not authorized' },
        { status: 404 }
      );
    }

    if (!existingAppointment.client.phone) {
      return NextResponse.json(
        { success: false, message: 'Client phone number not found' },
        { status: 400 }
      );
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: params.id
      },
      data: {
        scheduledTime: new Date(scheduledTime),
        duration,
        purpose,
        status,
        notes,
        caseType,
        venue,
        priority,
        requiredDocuments
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
        coordinator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Send SMS notification about the update
    const updateMessage = `Your appointment has been updated:\n${formatAppointmentMessage({
      scheduledTime,
      purpose,
      venue,
      duration
    })}`;

    await sendSMS(existingAppointment.client.phone, updateMessage);

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