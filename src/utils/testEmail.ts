import { sendEmail } from '@/lib/email';

export async function testEmailSetup() {
  try {
    const testData = {
      clientName: 'Test User',
      text: 'This is a test email to verify the email configuration.',
      requestId: 'TEST-123',
      pendingItems: ['Document verification', 'Payment confirmation']
    };

    await sendEmail({
      to: process.env.TEST_EMAIL || process.env.SMTP_USER!, // Send to yourself for testing
      subject: 'Test Email - Legal Services Platform',
      text: 'This is a test email.',
      template: 'reminder',
      data: testData
    });

    console.log('✅ Email test successful!');
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return false;
  }
} 