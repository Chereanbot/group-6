import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing Twilio credentials' }),
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    // Test the credentials by fetching account info
    const account = await client.api.accounts(accountSid).fetch();
    
    // Test the phone number
    const numbers = await client.incomingPhoneNumbers.list({phoneNumber: fromNumber});
    
    return NextResponse.json({
      success: true,
      account: {
        status: account.status,
        type: account.type,
        name: account.friendlyName,
      },
      phoneNumber: {
        verified: numbers.length > 0,
        number: fromNumber,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
    }, { status: 500 });
  }
} 