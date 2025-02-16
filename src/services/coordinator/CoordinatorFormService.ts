import { toast } from 'react-hot-toast';
import { CoordinatorType, CoordinatorStatus } from '@prisma/client';

interface CoordinatorFormData {
  email: string;
  password: string;
  fullName: string;
  officeId: string;
  phone?: string;
  address?: string;
  type?: CoordinatorType;
  status?: CoordinatorStatus;
  startDate?: string;
  endDate?: string;
  specialties?: string[];
}

interface CoordinatorResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export class CoordinatorFormService {
  async createCoordinator(data: CoordinatorFormData): Promise<CoordinatorResponse> {
    try {
      const response = await fetch('/api/coordinators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create coordinator');
      }

      toast.success('Coordinator created successfully');

      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('Create coordinator error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create coordinator';
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async checkOfficeAvailability(officeId: string): Promise<{
    available: boolean;
    maxAllowed: number;
    currentCount: number;
    remaining: number;
  }> {
    try {
      const response = await fetch(`/api/offices/${officeId}/availability`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check office availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Check office availability error:', error);
      throw error;
    }
  }
} 