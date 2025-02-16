import { api } from '@/lib/api';

export const messageService = {
  async sendMessage(data: {
    recipientId: string;
    subject: string;
    content: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    category?: 'CASE' | 'ADMINISTRATIVE' | 'GENERAL' | 'URGENT' | 'CONFIDENTIAL';
  }) {
    try {
      const response = await api.post('/api/lawyer/messages/send', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMessages(filter: string = 'inbox') {
    try {
      const response = await api.get(`/api/lawyer/messages?filter=${filter}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async markAsRead(messageId: string) {
    try {
      const response = await api.patch(`/api/lawyer/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async toggleStar(messageId: string) {
    try {
      const response = await api.patch(`/api/lawyer/messages/${messageId}/star`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async archiveMessage(messageId: string) {
    try {
      const response = await api.patch(`/api/lawyer/messages/${messageId}/archive`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 