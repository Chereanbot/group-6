import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';
import { prisma } from '@/lib/prisma';

interface ApprovalNotificationOptions {
  requestId: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceType: string;
  packageName: string;
  assignedLawyer?: {
    name: string;
    email: string;
    phone?: string;
  };
  nextSteps?: string[];
}

const emailTemplate = ({
  clientName,
  packageName,
  assignedLawyer,
  nextSteps = []
}: Partial<ApprovalNotificationOptions>) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2>Service Request Approved! 🎉</h2>
    <p>Dear ${clientName},</p>
    
    <p>Great news! Your service request for <strong>${packageName}</strong> has been approved.</p>
    
    ${assignedLawyer ? `
      <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <h3 style="margin-top: 0;">Your Assigned Lawyer</h3>
        <p><strong>${assignedLawyer.name}</strong><br>
        Email: ${assignedLawyer.email}<br>
        ${assignedLawyer.phone ? `Phone: ${assignedLawyer.phone}` : ''}</p>
      </div>
    ` : ''}
    
    ${nextSteps.length > 0 ? `
      <h3>Next Steps:</h3>
      <ul>
        ${nextSteps.map(step => `<li>${step}</li>`).join('')}
      </ul>
    ` : ''}
    
    <p>You can track your service request progress by logging into your account.</p>
    
    <p>Best regards,<br>Legal Services Team</p>
  </div>
`;

const smsTemplate = ({
  clientName,
  packageName,
  assignedLawyer
}: Partial<ApprovalNotificationOptions>) => `
Service Request Approved!
Hi ${clientName}, your request for ${packageName} has been approved.
${assignedLawyer ? `Your lawyer: ${assignedLawyer.name}` : ''}
Login to view details.
`;

export async function sendApprovalNotifications(options: ApprovalNotificationOptions) {
  const notifications = [];

  try {
    // Create in-app notification
    const inAppNotification = await prisma.notification.create({
      data: {
        userId: options.clientId,
        title: 'Service Request Approved',
        content: `Your service request for ${options.packageName} has been approved.`,
        type: 'SERVICE_APPROVAL',
        serviceRequestId: options.requestId,
        read: false
      }
    });
    notifications.push('IN_APP');

    // Send email if available
    if (options.clientEmail) {
      await sendEmail({
        to: options.clientEmail,
        subject: 'Service Request Approved',
        text: smsTemplate(options), // Fallback plain text
        template: 'approval',
        data: {
          ...options,
          html: emailTemplate(options)
        }
      });
      notifications.push('EMAIL');
    }

    // Send SMS if available
    if (options.clientPhone) {
      await sendSMS({
        to: options.clientPhone,
        message: smsTemplate(options)
      });
      notifications.push('SMS');
    }

    // Record the notification activity
    await prisma.serviceActivity.create({
      data: {
        requestId: options.requestId,
        type: 'APPROVAL_NOTIFICATION',
        description: `Approval notifications sent via ${notifications.join(', ')}`,
        userId: options.clientId
      }
    });

    return {
      success: true,
      notifications,
      message: `Approval notifications sent via ${notifications.join(', ')}`
    };
  } catch (error) {
    console.error('Error sending approval notifications:', error);
    throw error;
  }
} 