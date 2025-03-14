const INFOBIP_API_KEY = '00c145aecf663d99fcdc31a21e86c85a-4e624c72-f0aa-4358-8f9a-ca5a532b7390';
const INFOBIP_BASE_URL = '8knx23.api.infobip.com';

interface InfobipSMSResponse {
  messages: Array<{
    messageId: string;
    status: {
      groupId: number;
      groupName: string;
      id: number;
      name: string;
      description: string;
    };
  }>;
}

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('https://e5m8k1.api.infobip.com/sms/2/text/advanced', {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [{ to }],
            from: "Du las",
            text: message
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.statusText}`);
    }

    const data: InfobipSMSResponse = await response.json();
    
    // Check if the message was sent successfully
    const isSuccess = data.messages.every(msg => 
      msg.status.groupId === 1 || msg.status.groupName === "PENDING"
    );

    return isSuccess;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
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