import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const messageId = formData.get('MessageSid');
    const status = formData.get('MessageStatus');

    // Map Twilio status to our status enum
    const statusMap: { [key: string]: 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED' } = {
      'queued': 'SENDING',
      'sent': 'SENT',
      'delivered': 'DELIVERED',
      'failed': 'FAILED',
      'undelivered': 'FAILED',
    };

    if (messageId) {
      await prisma.phoneMessage.update({
        where: { id: messageId as string },
        data: { status: statusMap[status as string] || 'FAILED' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating message status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 