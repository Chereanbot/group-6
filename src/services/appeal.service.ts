import { Appeal, AppealFilters, AppealStats } from '@/types/appeal.types';
import { fetchWrapper } from '@/utils/fetchWrapper';

class AppealService {
  private baseUrl = '/api/appeals';

  async getAppeals(filters?: AppealFilters): Promise<Appeal[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.status?.length) {
          filters.status.forEach(status => 
            queryParams.append('status', status)
          );
        }
        if (filters.startDate) {
          queryParams.append('startDate', filters.startDate);
        }
        if (filters.endDate) {
          queryParams.append('endDate', filters.endDate);
        }
        if (filters.searchTerm) {
          queryParams.append('searchTerm', filters.searchTerm);
        }
      }

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetchWrapper.get<Appeal[]>(url);
      return response;
    } catch (error) {
      console.error('Error fetching appeals:', error);
      throw error;
    }
  }

  async getAppealStats(): Promise<AppealStats> {
    try {
      const response = await fetchWrapper.get<AppealStats>(`${this.baseUrl}/stats`);
      return response;
    } catch (error) {
      console.error('Error fetching appeal stats:', error);
      throw error;
    }
  }

  async updateAppeal(id: string, data: Partial<Appeal>): Promise<Appeal> {
    try {
      const response = await fetchWrapper.patch<Appeal>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating appeal:', error);
      throw error;
    }
  }

  async createAppeal(data: FormData): Promise<Appeal> {
    try {
      const response = await fetchWrapper.post<Appeal>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating appeal:', error);
      throw error;
    }
  }
}

export const appealService = new AppealService(); 