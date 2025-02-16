import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  throw new Error('Missing Twilio credentials');
}

// Log configuration (remove sensitive data in production)
console.log('Twilio Configuration:', {
  accountSid: accountSid.substring(0, 8) + '...',
  fromNumber,
  hasAuthToken: !!authToken,
  environment: process.env.NODE_ENV
});

let client: twilio.Twilio;

try {
  client = twilio(accountSid, authToken);
} catch (error) {
  console.error('Error initializing Twilio client:', error);
  throw new Error('Failed to initialize Twilio client');
}

export async function sendTwilioSMS(to: string, content: string) {
  try {
    // Verify credentials first
    const account = await client.api.accounts(accountSid).fetch();
    console.log('Twilio Account Status:', account.status);

    if (account.status !== 'active') {
      throw new Error('Twilio account is not active');
    }

    console.log('Attempting to send SMS:', {
      to,
      from: fromNumber,
      contentLength: content.length,
    });

    const message = await client.messages.create({
      body: content,
      from: fromNumber,
      to,
    });

    console.log('SMS sent successfully:', {
      sid: message.sid,
      status: message.status,
    });

    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    };
  } catch (error: any) {
    console.error('Twilio Error:', {
      code: error.code,
      message: error.message,
      status: error.status,
      moreInfo: error.moreInfo,
      details: error.details,
    });

    // Provide more specific error messages
    if (error.code === 20003) {
      throw new Error('Invalid Twilio credentials. Please check your account SID and auth token.');
    } else if (error.code === 21606) {
      throw new Error('The phone number is not a valid mobile number.');
    } else if (error.code === 21408) {
      throw new Error('Message content is too long.');
    }

    throw error;
  }
}

// Add a function to verify credentials
export async function verifyTwilioCredentials() {
  try {
    const account = await client.api.accounts(accountSid).fetch();
    return {
      success: true,
      status: account.status,
      type: account.type,
      name: account.friendlyName,
    };
  } catch (error: any) {
    console.error('Credential verification failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
} 