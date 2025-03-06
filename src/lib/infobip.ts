const INFOBIP_API_KEY = '00c145aecf663d99fcdc31a21e86c85a-4e624c72-f0aa-4358-8f9a-ca5a532b7390';
const INFOBIP_BASE_URL = '8knx23.api.infobip.com';

export async function sendSMS(to: string, message: string) {
  try {
    const response = await fetch(`https://${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [
              { to }
            ],
            from: "LegalAid",
            text: message,
          }
        ]
      })
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
}

export function formatAppointmentMessage(appointment: {
  scheduledTime: string | Date;
  purpose: string;
  venue?: string;
  duration: number;
}) {
  const date = new Date(appointment.scheduledTime);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `Your appointment has been scheduled for ${formattedDate} at ${formattedTime}.
Purpose: ${appointment.purpose}
Venue: ${appointment.venue || 'To be determined'}
Duration: ${appointment.duration} minutes

Please arrive 10 minutes before your scheduled time. If you need to reschedule, please contact us as soon as possible.`;
} 