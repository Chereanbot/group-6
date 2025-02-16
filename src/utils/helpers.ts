import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendSMS = async (to: string, message: string) => {
  try {
    await twilioClient.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error('Failed to send SMS');
  }
}; 