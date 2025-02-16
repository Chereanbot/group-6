import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    
    const result = await sendSMS(
      phoneNumber,
      'This is a test message from your legal aid system.'
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Test SMS failed:', error);
    return new NextResponse('Failed to send test SMS', { status: 500 });
  }
} 