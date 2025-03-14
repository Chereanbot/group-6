// Remove Twilio import and use fetch for InfoBip
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;
const INFOBIP_SENDER = process.env.INFOBIP_SENDER;

interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SMSOptions) {
  try {
    if (!INFOBIP_API_KEY || !INFOBIP_BASE_URL || !INFOBIP_SENDER) {
      throw new Error('Missing InfoBip credentials');
    }

    // Format phone number to E.164 format
    const formattedTo = to.startsWith('+') ? to : `+${to.replace(/\D/g, '')}`;

    const response = await fetch(`${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            from: INFOBIP_SENDER,
            destinations: [
              {
                to: formattedTo
              }
            ],
            text: message
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`InfoBip API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('SMS sending error:', error);
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