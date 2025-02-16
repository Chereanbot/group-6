import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const messageId = formData.get('MessageSid');
    const status = formData.get('MessageStatus');
    const to = formData.get('To');
    const from = formData.get('From');

    console.log('Twilio Callback received:', {
      messageId,
      status,
      to,
      from
    });

    // Update notification status based on delivery report
    if (messageId) {
      const notification = await prisma.notification.findFirst({
        where: {
          metadata: {
            path: ['twilioMessageId'],
            equals: messageId
          }
        }
      });

      if (notification) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            metadata: {
              ...notification.metadata,
              deliveryStatus: status,
              deliveredAt: new Date().toISOString(),
              deliveryReport: {
                messageId,
                status,
                to,
                from,
                timestamp: new Date().toISOString()
              }
            }
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Twilio callback:', error);
    return NextResponse.json(
      { error: 'Failed to process Twilio callback' },
      { status: 500 }
    );
  }
} 