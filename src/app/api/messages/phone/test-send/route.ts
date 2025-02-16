import { NextResponse } from 'next/server';
import { sendTwilioSMS } from '@/lib/twilio-server';
import { formatPhoneNumber, validatePhoneNumber } from '@/services/sms';

// Add a test secret key for basic security
const TEST_SECRET = process.env.TEST_SECRET || 'test-secret-key';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('x-test-secret');
    
    // Basic security check - you should use a more secure method in production
    if (!authHeader || authHeader !== TEST_SECRET) {
      // Allow requests from localhost without auth for testing
      const origin = request.headers.get('origin');
      if (!origin?.includes('localhost') && !origin?.includes('127.0.0.1')) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const { phoneNumber, content } = await request.json();

    // Input validation
    if (!phoneNumber?.trim()) {
      return new NextResponse('Phone number is required', { status: 400 });
    }
    if (!content?.trim()) {
      return new NextResponse('Message content is required', { status: 400 });
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      console.log('Invalid phone number format:', phoneNumber);
      return new NextResponse('Invalid Ethiopian phone number format', { status: 400 });
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log('Attempting to send test SMS to:', formattedNumber);

    // Send SMS
    try {
      const result = await sendTwilioSMS(formattedNumber, content);
      console.log('Twilio send result:', result);
      
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        status: result.status
      });
    } catch (error: any) {
      console.error('SMS sending error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo,
      });

      return new NextResponse(
        JSON.stringify({
          error: error.message,
          code: error.code,
          details: error.moreInfo
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 