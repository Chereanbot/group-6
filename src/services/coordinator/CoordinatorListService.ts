import { Coordinator } from '@prisma/client';

export class CoordinatorListService {
  private baseUrl = '/api/coordinators';

  async getCoordinators(filters?: any): Promise<Coordinator[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch coordinators');
      }

      return data.data;

    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  async deleteCoordinator(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete coordinator');
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete coordinator';
      throw new Error(errorMessage);
    }
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ids, status })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  }

  async exportCoordinators(filter?: CoordinatorFilter): Promise<Blob> {
    const params = new URLSearchParams();
    if (filter) {
      // Add filter params...
    }
    const response = await fetch(`${this.baseUrl}/export?${params.toString()}`);
    return response.blob();
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch coordinator stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  async exportSelected(ids: string[]): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export-selected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    return response.blob();
  }

  async blockCoordinator(id: string, action: 'block' | 'ban', reason: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} coordinator`);
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : `Failed to ${action} coordinator`);
    }
  }

  async getBlockHistory(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/block-history`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch block history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get block history error:', error);
      throw error;
    }
  }
} 