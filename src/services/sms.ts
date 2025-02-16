export async function sendSMS(phoneNumber: string, content: string) {
  try {
    const response = await fetch('/api/messages/phone/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        content,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending SMS:', error);
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
    return /^\+2519\d{8}$/.test(formatted);
  } catch {
    return false;
  }
}

export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  try {
    const formatted = formatPhoneNumber(phoneNumber);
    return formatted.replace(/^\+(\d{3})(\d)(\d{3})(\d{4})$/, '+$1 $2 $3 $4');
  } catch {
    return phoneNumber;
  }
} 