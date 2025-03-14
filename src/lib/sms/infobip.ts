import axios from 'axios';
import { SMS_PROVIDER_CONFIG, SMS_STATUS } from './config';

interface InfobipSmsResponse {
  messages: {
    to: string;
    status: {
      groupId: number;
      groupName: string;
      id: number;
      name: string;
      description: string;
    };
    messageId: string;
  }[];
}

export class InfobipSmsService {
  private baseUrl: string;
  private apiKey: string;
  private sender: string;

  constructor() {
    this.baseUrl = process.env.INFOBIP_BASE_URL || '';
    this.apiKey = process.env.INFOBIP_API_KEY || '';
    this.sender = process.env.INFOBIP_SENDER_ID || '';

    // Log configuration status
    console.log('Infobip Configuration:', {
      baseUrl: this.baseUrl,
      apiKeyPresent: !!this.apiKey,
      sender: this.sender
    });

    // Verify configuration on startup
    this.verifyConfiguration();
  }

  private async verifyConfiguration(): Promise<void> {
    try {
      // Test the API key and account status
      const response = await axios.get(
        `${this.baseUrl}/account/1/balance`,
        {
          headers: {
            'Authorization': `App ${this.apiKey}`,
            'Accept': 'application/json',
          },
        }
      );
      console.log('Infobip account verification:', {
        status: 'success',
        balance: response.data.balance,
        currency: response.data.currency
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Infobip account verification failed:', {
          status: error.response?.status,
          error: error.response?.data,
          message: 'Please check your Infobip account status and API key permissions'
        });
      }
    }
  }

  async sendSms(to: string, message: string): Promise<{
    status: string;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Validate configuration
      if (!this.baseUrl || !this.apiKey || !this.sender) {
        console.error('Missing Infobip configuration:', {
          baseUrl: !!this.baseUrl,
          apiKey: !!this.apiKey,
          sender: !!this.sender
        });
        throw new Error('Infobip configuration is incomplete');
      }

      // Format the phone number if it doesn't start with +
      const formattedTo = to.startsWith('+') ? to : `+${to}`;

      console.log('Sending SMS via Infobip:', {
        to: formattedTo,
        sender: this.sender,
        messageLength: message.length
      });

      // Simplified payload matching the curl example from your dashboard
      const payload = {
        messages: [{
          destinations: [{
            to: formattedTo
          }],
          from: this.sender,
          text: message
        }]
      };

      console.log('Infobip request payload:', payload);

      const response = await axios.post<InfobipSmsResponse>(
        `${this.baseUrl}/sms/2/text/advanced`,
        payload,
        {
          headers: {
            'Authorization': `App ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      console.log('Infobip response:', response.data);

      const result = response.data.messages[0];
      
      // Check for specific error conditions in the response
      if (result.status.groupName === 'REJECTED') {
        if (result.status.id === 579) {
          return {
            status: SMS_STATUS.FAILED,
            error: 'Phone number not whitelisted. For trial accounts, you need to whitelist phone numbers in the Infobip dashboard.',
          };
        }
        return {
          status: SMS_STATUS.FAILED,
          error: `Message rejected: ${result.status.description}`,
        };
      }

      if (result.status.groupName === 'PENDING' || result.status.groupName === 'ACCEPTED') {
        console.log('Message accepted by Infobip:', {
          messageId: result.messageId,
          status: result.status.groupName,
          description: result.status.description
        });
        return {
          status: SMS_STATUS.SENT,
          messageId: result.messageId,
        };
      } else {
        console.error('Message not accepted:', {
          status: result.status.groupName,
          description: result.status.description
        });
        return {
          status: SMS_STATUS.FAILED,
          error: `Sending failed: ${result.status.description}`,
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Infobip API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // Check for specific error conditions
        if (error.response?.status === 401) {
          return {
            status: SMS_STATUS.FAILED,
            error: 'Invalid API key or unauthorized access',
          };
        } else if (error.response?.status === 403) {
          return {
            status: SMS_STATUS.FAILED,
            error: 'Sender ID not approved or account not activated',
          };
        }

        return {
          status: SMS_STATUS.FAILED,
          error: `API Error: ${error.response?.data?.requestError?.serviceException?.text || error.message}`,
        };
      }
      
      console.error('Infobip SMS sending error:', error);
      return {
        status: SMS_STATUS.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getMessageStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      if (!this.baseUrl || !this.apiKey) {
        throw new Error('Infobip configuration is incomplete');
      }

      const response = await axios.get(
        `${this.baseUrl}/sms/1/reports?messageId=${messageId}`,
        {
          headers: {
            'Authorization': `App ${this.apiKey}`,
            'Accept': 'application/json',
          },
        }
      );

      console.log('Message status response:', response.data);

      const status = response.data.results[0]?.status?.groupName;
      
      switch (status?.toUpperCase()) {
        case 'DELIVERED':
          return { status: SMS_STATUS.DELIVERED };
        case 'UNDELIVERABLE':
        case 'REJECTED':
          return { status: SMS_STATUS.FAILED };
        case 'PENDING':
          return { status: SMS_STATUS.PENDING };
        case 'ACCEPTED':
        case 'SCHEDULED':
          return { status: SMS_STATUS.SENT };
        default:
          return { status: SMS_STATUS.FAILED };
      }
    } catch (error) {
      console.error('Error checking message status:', error);
      return {
        status: SMS_STATUS.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getBalance(): Promise<{
    balance?: number;
    error?: string;
  }> {
    try {
      if (!this.baseUrl || !this.apiKey) {
        throw new Error('Infobip configuration is incomplete');
      }

      const response = await axios.get(
        `${this.baseUrl}/account/1/balance`,
        {
          headers: {
            'Authorization': `App ${this.apiKey}`,
            'Accept': 'application/json',
          },
        }
      );

      return {
        balance: response.data.balance,
      };
    } catch (error) {
      console.error('Error checking balance:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
} 