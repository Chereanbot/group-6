import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS, formatAppointmentMessage } from '@/lib/infobip';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const headers = request.headers;
    const authHeader = headers.get('authorization');
    const cookies = headers.get('cookie');
    const token = authHeader?.split(' ')[1] || cookies?.split('token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const verified = await verifyAuth(token);
    if (!verified) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.client.phone) {
      return NextResponse.json(
        { message: 'Client phone number not found' },
        { status: 400 }
      );
    }

    const message = formatAppointmentMessage({
      scheduledTime: appointment.scheduledTime,
      purpose: appointment.purpose,
      venue: appointment.venue,
      duration: appointment.duration,
    });

    await sendSMS(appointment.client.phone, message);

    return NextResponse.json(
      { message: 'Notification sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { message: 'Failed to send notification' },
      { status: 500 }
    );
  }
} 