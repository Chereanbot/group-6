interface NotificationMessage {
  scheduledTime: string;
  purpose: string;
  venue: string;
  duration: number;
  status?: string;
  cancellationReason?: string;
}

export const formatAppointmentMessage = (data: NotificationMessage): string => {
  const date = new Date(data.scheduledTime).toLocaleDateString();
  const time = new Date(data.scheduledTime).toLocaleTimeString();
  
  let message = `Your appointment has been scheduled for ${date} at ${time}\n`;
  message += `Purpose: ${data.purpose}\n`;
  message += `Venue: ${data.venue}\n`;
  message += `Duration: ${data.duration} minutes`;

  if (data.status) {
    message = `Your appointment has been ${data.status.toLowerCase()}\n`;
    message += `Date: ${date}\n`;
    message += `Time: ${time}\n`;
    message += `Purpose: ${data.purpose}\n`;
    message += `Venue: ${data.venue}`;

    if (data.cancellationReason) {
      message += `\nReason: ${data.cancellationReason}`;
    }
  }

  return message;
};

export const sendSMS = async (phone: string, message: string): Promise<void> => {
  // Implement SMS sending logic here
  console.log(`Sending SMS to ${phone}: ${message}`);
};

export const sendEmail = async (data: { to: string; subject: string; html: string }): Promise<void> => {
  // Implement email sending logic here
  console.log(`Sending email to ${data.to}: ${data.subject}`);
}; 