import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, text } = body;

    // Get recipient details
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        userRole: true
      }
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Get sender details
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        userRole: true
      }
    });

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    // Create SMS record
    const sms = await prisma.sMS.create({
      data: {
        text,
        senderId: sender.id,
        recipientId: recipient.id,
        status: 'SENT'
      }
    });

    // Send SMS using InfoBip
    const smsResponse = await sendSMS({
      to: recipient.phone,
      message: `${sender.fullName}: ${text}`
    });

    // Check InfoBip response
    const messageStatus = smsResponse.messages?.[0]?.status;
    if (messageStatus?.groupName === 'REJECTED' || messageStatus?.groupName === 'FAILED') {
      throw new Error(`SMS sending failed: ${messageStatus.description}`);
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: recipient.id,
        title: 'New SMS from Lawyer',
        message: `${sender.fullName}: ${text}`,
        type: 'SMS',
        priority: 'NORMAL',
        link: `/client/communications/sms?contact=${sender.id}`
      }
    });

    // Update SMS record with InfoBip message ID if available
    if (smsResponse.messages?.[0]?.messageId) {
      await prisma.sMS.update({
        where: { id: sms.id },
        data: {
          messageId: smsResponse.messages[0].messageId,
          status: messageStatus?.groupName === 'ACCEPTED' ? 'DELIVERED' : 'SENT'
        }
      });
    }

    return NextResponse.json({
      success: true,
      sms: {
        ...sms,
        sender,
        recipient,
        createdAt: sms.createdAt.toISOString(),
        messageId: smsResponse.messages?.[0]?.messageId
      }
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send SMS' },
      { status: 500 }
    );
  }
} 