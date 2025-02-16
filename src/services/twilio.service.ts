import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async ({ to, body }: { to: string; body: string }) => {
  try {
    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
}; 