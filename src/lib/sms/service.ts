import { prisma } from '@/lib/prisma';
import { InfobipSmsService } from './infobip';
import { validatePhoneNumber, formatPhoneNumber, RATE_LIMITS } from './config';
import { MessageDirection, MessageStatus } from '@prisma/client';

class SmsService {
  private smsProvider: InfobipSmsService;
  private rateLimits: Map<string, number>;
  private lastSentTime: Map<string, number>;

  constructor() {
    this.smsProvider = new InfobipSmsService();
    this.rateLimits = new Map();
    this.lastSentTime = new Map();
  }

  private async checkRateLimit(phone: string): Promise<boolean> {
    const now = Date.now();
    const lastSent = this.lastSentTime.get(phone) || 0;
    const count = this.rateLimits.get(phone) || 0;

    // Reset count if last sent was more than an hour ago
    if (now - lastSent > 60 * 60 * 1000) {
      this.rateLimits.set(phone, 0);
      return true;
    }

    if (count >= RATE_LIMITS.MAX_SMS_PER_HOUR) {
      return false;
    }

    this.rateLimits.set(phone, count + 1);
    this.lastSentTime.set(phone, now);
    return true;
  }

  async sendSms(recipientPhone: string, message: string, senderId: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Basic validation for phone number format
      if (!validatePhoneNumber(recipientPhone)) {
        throw new Error('Invalid phone number format');
      }

      // Format phone number
      const formattedPhone = formatPhoneNumber(recipientPhone);

      console.log('Processing SMS send request:', {
        originalPhone: recipientPhone,
        formattedPhone: formattedPhone,
        messageLength: message.length
      });

      // Check rate limit
      if (!await this.checkRateLimit(formattedPhone)) {
        throw new Error('Rate limit exceeded for this number');
      }

      // Send SMS
      const result = await this.smsProvider.sendSms(formattedPhone, message);

      // Save to database
      const smsMessage = await prisma.phoneMessage.create({
        data: {
          phoneNumber: formattedPhone,
          content: message,
          status: result.status as MessageStatus,
          direction: MessageDirection.OUTGOING,
          messageId: result.messageId || '',
          userId: senderId,
          timestamp: new Date()
        },
      });

      console.log('SMS message saved:', {
        id: smsMessage.id,
        status: result.status,
        messageId: result.messageId
      });

      // If message was accepted, check its status after a short delay
      if (result.messageId && (result.status === 'SENT' || result.status === 'PENDING')) {
        setTimeout(async () => {
          try {
            const statusResult = await this.smsProvider.getMessageStatus(result.messageId!);
            console.log('Delayed status check:', {
              messageId: result.messageId,
              status: statusResult.status
            });

            // Update status in database
            await prisma.phoneMessage.update({
              where: { id: smsMessage.id },
              data: { status: statusResult.status as MessageStatus }
            });
          } catch (error) {
            console.error('Error checking message status:', error);
          }
        }, 5000); // Check status after 5 seconds
      }

      if (result.status === 'SENT' || result.status === 'DELIVERED' || result.status === 'PENDING') {
        return {
          success: true,
          messageId: result.messageId,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to send SMS',
        };
      }
    } catch (error) {
      console.error('SMS Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async checkMessageStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      const result = await this.smsProvider.getMessageStatus(messageId);

      // Update status in database
      if (result.status) {
        await prisma.phoneMessage.updateMany({
          where: { messageId: messageId },
          data: { status: result.status as MessageStatus },
        });
      }

      return result;
    } catch (error) {
      console.error('Error checking message status:', error);
      return {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getBalance(): Promise<{
    balance?: number;
    error?: string;
  }> {
    return this.smsProvider.getBalance();
  }

  async sendBulkSms(recipients: Array<{ phone: string; name: string }>, message: string, senderId: string): Promise<{
    success: boolean;
    results: Array<{
      phone: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    const results = [];
    let allSuccess = true;

    for (const recipient of recipients) {
      const result = await this.sendSms(recipient.phone, message, senderId);
      results.push({
        phone: recipient.phone,
        success: result.success,
        error: result.error,
      });

      if (!result.success) {
        allSuccess = false;
      }
    }

    return {
      success: allSuccess,
      results,
    };
  }
}

export const smsService = new SmsService(); 