import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, content, subject } = await request.json();

    // Validate phone number
    const phoneRegex = /^\+?\d{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      body: content,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    // Store message in database
    const dbMessage = await prisma.message.create({
      data: {
        subject: subject || 'SMS Message',
        content,
        senderId: session.user.id,
        recipientPhone: phoneNumber,
        messageType: 'SMS',
        status: message.status,
        externalId: message.sid,
        priority: 'MEDIUM',
        category: 'SMS'
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userRole: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: dbMessage,
      twilioStatus: message.status
    });

  } catch (error) {
    console.error('SMS Send Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send SMS' },
      { status: 500 }
    );
  }
} 