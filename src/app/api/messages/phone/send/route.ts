import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendTwilioSMS } from '@/lib/twilio-server';
import { formatPhoneNumber, validatePhoneNumber } from '@/services/sms';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { phoneNumber, content } = await request.json();
    console.log('Received SMS request:', { phoneNumber, contentLength: content?.length });

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
    console.log('Formatted phone number:', formattedNumber);

    // Create message in database
    const message = await prisma.phoneMessage.create({
      data: {
        phoneNumber: formattedNumber,
        content,
        status: 'DRAFT',
        direction: 'OUTGOING',
        userId: session.user.id,
      },
    });

    console.log('Created message in database:', message.id);

    // Send SMS
    try {
      const result = await sendTwilioSMS(formattedNumber, content);
      console.log('Twilio send result:', result);
      
      // Update message with Twilio message ID and status
      const updatedMessage = await prisma.phoneMessage.update({
        where: { id: message.id },
        data: { 
          status: 'SENT',
          messageId: result.messageId 
        },
      });

      return NextResponse.json(updatedMessage);
    } catch (error: any) {
      console.error('SMS sending error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo,
      });

      // Update message status to failed
      await prisma.phoneMessage.update({
        where: { id: message.id },
        data: { status: 'FAILED' }
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