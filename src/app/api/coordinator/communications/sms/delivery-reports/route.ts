import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SMSStatus } from '@/lib/sms/config';

export async function POST(request: Request) {
  try {
    const reports = await request.json();

    // Process each delivery report
    for (const report of reports.results) {
      const { messageId, status, error } = report;

      // Find the message in our database
      const message = await prisma.smsMessage.findFirst({
        where: { messageId: messageId }
      });

      if (!message) {
        console.error(`Message not found for messageId: ${messageId}`);
        continue;
      }

      // Determine message status
      let newStatus = message.status;
      if (status.groupName === 'DELIVERED') {
        newStatus = SMSStatus.DELIVERED;
      } else if (status.groupName === 'REJECTED' || status.groupName === 'FAILED') {
        newStatus = SMSStatus.FAILED;
      }

      // Update message status and metadata
      await prisma.smsMessage.update({
        where: { id: message.id },
        data: {
          status: newStatus,
          metadata: {
            ...(message.metadata as Record<string, any>),
            deliveryStatus: status.groupName,
            deliveryDescription: status.description,
            deliveredAt: status.groupName === 'DELIVERED' ? new Date().toISOString() : null,
            error: error?.description || null,
            lastStatusUpdate: new Date().toISOString()
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing delivery reports:', error);
    return NextResponse.json(
      { error: 'Failed to process delivery reports' },
      { status: 500 }
    );
  }
} 