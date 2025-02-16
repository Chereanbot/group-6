import { NextResponse } from 'next/server';
import { verifyTwilioCredentials } from '@/lib/twilio-server';

export async function GET() {
  try {
    const result = await verifyTwilioCredentials();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
} 