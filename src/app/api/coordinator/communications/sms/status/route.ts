import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { smsClient, SMSStatus, SMS_ERRORS, SMS_SUCCESS, getLocalizedMessage } from '@/lib/sms/config';

type SMSMetadata = {
  [key: string]: string | number | null | undefined;
};

export async function GET(request: Request) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.split(' ')[1] ||
      request.headers.get('cookie')?.split(';')
        .find(c => c.trim().startsWith('auth-token='))
        ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const language = searchParams.get('language') || 'en';

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Get message from database
    const message = await prisma.smsMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this message
    if (message.senderId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to view this message' },
        { status: 403 }
      );
    }

    // If message has Africa's Talking messageId, fetch latest status
    if (message.messageId) {
      try {
        const response = await smsClient.fetchDeliveryReports({
          messageId: message.messageId
        });

        if (response.SMSMessageData.DeliveryReports && response.SMSMessageData.DeliveryReports.length > 0) {
          const report = response.SMSMessageData.DeliveryReports[0];
          
          // Update metadata with latest status
          const updatedMetadata: SMSMetadata = {
            ...(message.metadata as SMSMetadata),
            lastStatusCheck: new Date().toISOString(),
            deliveryStatus: report.status,
            failureReason: report.failureReason || null,
            networkCode: report.networkCode || null
          };

          // Determine message status
          let newStatus = message.status;
          if (report.status === 'Success' || report.status === 'Delivered') {
            newStatus = SMSStatus.DELIVERED;
          } else if (report.status === 'Failed') {
            newStatus = SMSStatus.FAILED;
          }

          // Update message status in database
          const updatedMessage = await prisma.smsMessage.update({
            where: { id: messageId },
            data: {
              status: newStatus,
              metadata: updatedMetadata
            }
          });

          return NextResponse.json({
            success: true,
            message: {
              ...updatedMessage,
              statusMessage: getLocalizedMessage(
                newStatus === SMSStatus.DELIVERED ? SMS_SUCCESS.DELIVERED : SMS_ERRORS.SENDING_FAILED,
                language as 'en' | 'am'
              )
            },
            deliveryReport: report
          });
        }
      } catch (error) {
        console.error('Error fetching message status:', error);
        // Continue to return existing message data even if status check fails
        return NextResponse.json({
          success: false,
          message,
          error: 'Failed to fetch latest delivery status'
        });
      }
    }

    // If no messageId or no delivery report, return current status
    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Error checking message status:', error);
    return NextResponse.json(
      { error: 'Failed to check message status' },
      { status: 500 }
    );
  }
} 