import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !fromNumber) {
  throw new Error('Missing Twilio credentials in environment variables');
}

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, content: string) {
  try {
    const formattedNumber = formatPhoneNumber(to);
    console.log(`Sending SMS to ${formattedNumber} from ${fromNumber}`);

    // Add error handling for empty or invalid content
    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    // Attempt to send the message
    const message = await client.messages.create({
      body: content,
      from: fromNumber,
      to: formattedNumber,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/messages/phone/status-webhook`,
    });

    console.log(`SMS sent successfully. Message SID: ${message.sid}`);

    if (message.errorCode) {
      throw new Error(`Twilio Error: ${message.errorMessage}`);
    }

    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    // Add more specific error handling
    if (error.code === 21211) {
      throw new Error('Invalid phone number format');
    } else if (error.code === 21408) {
      throw new Error('Message content too long');
    } else if (error.code === 21610) {
      throw new Error('Message cannot be empty');
    }
    throw error;
  }
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Ethiopian numbers
  if (cleaned.startsWith('251')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.startsWith('0')) {
    return `+251${cleaned.substring(1)}`;
  }
  
  if (cleaned.startsWith('9')) {
    return `+251${cleaned}`;
  }
  
  throw new Error('Invalid Ethiopian phone number format');
}

export function validatePhoneNumber(phoneNumber: string): boolean {
  try {
    const formatted = formatPhoneNumber(phoneNumber);
    // Ethiopian numbers should be +251 followed by 9 digits
    return /^\+2519\d{8}$/.test(formatted);
  } catch {
    return false;
  }
}

// Helper function to format phone number for display
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  try {
    const formatted = formatPhoneNumber(phoneNumber);
    // Format as: +251 9X XXX XXXX
    return formatted.replace(/^\+(\d{3})(\d)(\d{3})(\d{4})$/, '+$1 $2 $3 $4');
  } catch {
    return phoneNumber;
  }
} 