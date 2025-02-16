import { ServiceRequest, ServiceStats } from '@/types/service.types';
import { fetchWrapper } from '@/utils/fetchWrapper';

const BASE_URL = '/api/services';

export const serviceService = {
  async getServiceRequests(filters: any): Promise<ServiceRequest[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });

      const response = await fetchWrapper.get<{ data: ServiceRequest[] }>(
        `${BASE_URL}/requests${queryParams.toString() ? `?${queryParams}` : ''}`
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  },

  async getServiceStats(): Promise<ServiceStats> {
    try {
      const response = await fetchWrapper.get<{ data: ServiceStats }>(`${BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw error;
    }
  },

  async updateServiceRequest(requestId: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    try {
      const response = await fetchWrapper.patch<ServiceRequest>(
        `${BASE_URL}/requests/${requestId}`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error updating service request:', error);
      throw error;
    }
  },

  async assignLawyer(requestId: string, lawyerId: string): Promise<ServiceRequest> {
    try {
      const response = await fetchWrapper.patch<ServiceRequest>(
        `${BASE_URL}/requests/${requestId}/assign`,
        { lawyerId }
      );
      return response;
    } catch (error) {
      console.error('Error assigning lawyer:', error);
      throw error;
    }
  },

  async verifyLegalAidEligibility(requestId: string, isEligible: boolean): Promise<ServiceRequest> {
    try {
      const response = await fetchWrapper.patch<ServiceRequest>(
        `${BASE_URL}/requests/${requestId}/verify-eligibility`,
        { isEligible }
      );
      return response;
    } catch (error) {
      console.error('Error verifying eligibility:', error);
      throw error;
    }
  }
}; 