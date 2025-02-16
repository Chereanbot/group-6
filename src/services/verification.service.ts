import { fetchWrapper } from '@/utils/fetchWrapper';
import { toast } from 'react-hot-toast';

class VerificationService {
  private baseUrl = '/api/verifications';

  async verifyDocuments(requestId: string, documentIds: string[]) {
    try {
      if (!documentIds.length) {
        throw new Error('No documents selected for verification');
      }

      const response = await fetchWrapper.post(`${this.baseUrl}/documents`, {
        requestId,
        documentIds
      });

      if (!response.success) {
        throw new Error(response.error || 'Verification failed');
      }

      toast.success('Documents verified successfully');
      return response.documents;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify documents';
      toast.error(message);
      throw error;
    }
  }

  async verifyPayment(requestId: string) {
    try {
      const response = await fetchWrapper.post(`${this.baseUrl}/payment`, {
        requestId
      });

      if (!response.success) {
        throw new Error(response.error || 'Payment verification failed');
      }

      toast.success('Payment verified successfully');
      return response.payment;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify payment';
      toast.error(message);
      throw error;
    }
  }

  async verifyIncome(requestId: string, verified: boolean, notes?: string) {
    return fetchWrapper.post(`${this.baseUrl}/income`, {
      requestId,
      verified,
      notes
    });
  }

  async getVerificationHistory(requestId: string) {
    return fetchWrapper.get(`${this.baseUrl}/history/${requestId}`);
  }

  async addVerificationNote(requestId: string, note: string) {
    return fetchWrapper.post(`${this.baseUrl}/notes`, {
      requestId,
      note
    });
  }

  async requestAdditionalDocuments(requestId: string, requirements: string[]) {
    return fetchWrapper.post(`${this.baseUrl}/request-documents`, {
      requestId,
      requirements
    });
  }

  async sendReminder(requestId: string, options?: {
    type?: 'EMAIL' | 'SMS' | 'ALL';
    message?: string;
  }) {
    try {
      const response = await fetchWrapper.post('/api/reminders', {
        requestId,
        ...options
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send reminder');
      }

      if (response.reminder.status === 'FAILED') {
        throw new Error(response.reminder.message || 'Reminder failed to send');
      }

      toast.success('Reminder sent successfully');
      return response.reminder;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to send reminder. Please try again.';
      toast.error(message);
      throw error;
    }
  }

  async getReminderHistory(requestId: string) {
    return fetchWrapper.get(`/api/reminders/history/${requestId}`);
  }
}

export const verificationService = new VerificationService(); 