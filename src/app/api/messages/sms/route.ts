import { NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { verifyAuth } from '@/lib/auth';

// Initialize Twilio client
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Get the Twilio phone number from environment variables
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

if (!TWILIO_PHONE_NUMBER) {
  console.error('TWILIO_PHONE_NUMBER is not set in environment variables');
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Only allow SUPER_ADMIN and ADMIN to send SMS
    if (!['SUPER_ADMIN', 'ADMIN'].includes(authResult.user.userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!TWILIO_PHONE_NUMBER) {
      return NextResponse.json(
        { error: 'Twilio phone number not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Format phone number to E.164 format if not already formatted
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    // Send SMS using Twilio
    const smsResponse = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log('Twilio SMS Response:', smsResponse);

    return NextResponse.json({
      success: true,
      messageId: smsResponse.sid,
      message: 'SMS sent successfully'
    });

  } catch (error: any) {
    console.error('Error sending SMS:', error);
    
    // Handle Twilio-specific errors
    if (error.code) {
      return NextResponse.json({
        success: false,
        error: `Twilio Error: ${error.message}`,
        code: error.code
      }, { status: 400 });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send SMS',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 