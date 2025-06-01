import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/infobip';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can create appointments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { scheduledTime, clientId, purpose, venue, duration, priority, notes } = body;

    // First get the client details
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        scheduledTime: new Date(scheduledTime),
        status: 'SCHEDULED',
        purpose,
        venue,
        duration,
        priority,
        notes,
        caseType: 'GENERAL',
        caseDetails: purpose,
        requiredDocuments: [],
        reminderType: ['EMAIL', 'SMS'],
        reminderTiming: [24, 1],
        client: {
          connect: { id: clientId }
        },
        coordinator: {
          connect: { id: userId }
        }
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        coordinator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send SMS notification if SMS is selected as reminder type
    if (appointment.reminderType.includes('SMS')) {
      const formattedDate = format(new Date(scheduledTime), 'PPP p');
      const message = `Your appointment has been scheduled for ${formattedDate}.\n` +
        `Purpose: ${purpose}\n` +
        `Duration: ${duration} minutes\n` +
        `${venue ? `Venue: ${venue}\n` : ''}` +
        `Priority: ${priority}\n` +
        `Coordinator: ${appointment.coordinator.fullName}\n` +
        `${notes ? `Notes: ${notes}` : ''}`;

      // Send SMS to client
      if (appointment.client.phone) {
        await sendSMS(
          appointment.client.phone,
          message
        );
      }

      // Send SMS to coordinator
      if (appointment.coordinator.phone) {
        const coordinatorMessage = `New appointment scheduled:\n` +
          `Client: ${appointment.client.fullName}\n` +
          `Date: ${formattedDate}\n` +
          `Purpose: ${purpose}\n` +
          `Priority: ${priority}`;
        
        await sendSMS(
          appointment.coordinator.phone,
          coordinatorMessage
        );
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 