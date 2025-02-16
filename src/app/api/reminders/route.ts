import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const { requestId, type = 'ALL', message } = await request.json();

    // Validate input
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get service request with client details
      const serviceRequest = await tx.serviceRequest.findUnique({
        where: { id: requestId },
        include: {
          client: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true
            }
          }
        }
      });

      if (!serviceRequest) {
        throw new Error('Service request not found');
      }

      if (!serviceRequest.client) {
        throw new Error('Client information not found');
      }

      // Create reminder record
      const reminder = await tx.reminder.create({
        data: {
          serviceRequestId: requestId,
          type,
          message: message || getDefaultMessage(serviceRequest),
          status: 'PENDING'
        }
      });

      const notifications = [];
      const finalMessage = message || getDefaultMessage(serviceRequest);

      // Send email notification if applicable
      if ((type === 'ALL' || type === 'EMAIL') && serviceRequest.client.email) {
        try {
          await sendEmail({
            to: serviceRequest.client.email,
            subject: 'Action Required: Service Request Update',
            text: finalMessage,
            template: 'reminder',
            data: {
              clientName: serviceRequest.client.fullName,
              requestId: serviceRequest.id,
              pendingItems: getPendingItems(serviceRequest)
            }
          });
          notifications.push('EMAIL');
        } catch (error) {
          console.error('Email sending failed:', error);
        }
      }

      // Send SMS notification if applicable
      if ((type === 'ALL' || type === 'SMS') && serviceRequest.client.phone) {
        try {
          await sendSMS({
            to: serviceRequest.client.phone,
            message: finalMessage
          });
          notifications.push('SMS');
        } catch (error) {
          console.error('SMS sending failed:', error);
        }
      }

      // Always create in-app notification
      await tx.notification.create({
        data: {
          userId: serviceRequest.client.id,
          serviceRequestId: requestId,
          title: 'Action Required',
          content: finalMessage,
          type: 'REMINDER',
          read: false
        }
      });
      notifications.push('IN_APP');

      // Update reminder status
      const updatedReminder = await tx.reminder.update({
        where: { id: reminder.id },
        data: {
          status: notifications.length > 0 ? 'SENT' : 'FAILED',
          sentAt: notifications.length > 0 ? new Date() : null
        }
      });

      // Create activity record
      await tx.serviceActivity.create({
        data: {
          requestId,
          userId: serviceRequest.client.id,
          type: 'REMINDER_SENT',
          description: `Reminder sent via ${notifications.join(', ')}: ${finalMessage}`
        }
      });

      return {
        success: true,
        reminder: updatedReminder,
        notifications,
        message: 'Reminder processed successfully'
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in reminder API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send reminder',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getPendingItems(request: any) {
  const pending = [];
  
  if (!request.documents?.every(d => d.verified)) {
    pending.push('Document verification');
  }
  
  if (request.payment && !request.payment.verified) {
    pending.push('Payment verification');
  }
  
  if (request.incomeProof && !request.incomeProof.verified) {
    pending.push('Income verification');
  }
  
  return pending;
}

function getDefaultMessage(request: any) {
  const pending = getPendingItems(request);
  if (!pending.length) return 'Please review your service request status.';
  
  return `Action required for your service request: ${pending.join(', ')} pending.`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        serviceRequestId: requestId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        serviceRequest: {
          include: {
            client: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      reminders
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 