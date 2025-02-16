import { CaseMetrics, TimelineEvent, ChartData, Case, User } from '@/types/case.types';

class CaseService {
  private async fetchWithErrorHandling<T>(url: string, defaultValue: T): Promise<T> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if response contains error
      if (data.error) {
        throw new Error(data.error);
      }

      // Return the data property if it exists, otherwise return the whole response
      return (data.data || data) as T;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      return defaultValue;
    }
  }

  async getCaseMetrics(): Promise<CaseMetrics> {
    const defaultMetrics: CaseMetrics = {
      totalCases: 0,
      activeCases: 0,
      pendingCases: 0,
      resolvedCases: 0,
      highPriorityCases: 0,
      averageResolutionTime: 0,
      successRate: 0
    };
    return this.fetchWithErrorHandling<CaseMetrics>('/api/cases/metrics', defaultMetrics);
  }

  async getCaseTimeline(): Promise<TimelineEvent[]> {
    return this.fetchWithErrorHandling<TimelineEvent[]>('/api/cases/timeline', []);
  }

  async getCaseChartData(): Promise<ChartData> {
    const defaultChartData: ChartData = {
      progressData: {
        labels: [],
        datasets: [{
          label: 'Cases',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }]
      },
      resolutionData: {
        labels: [],
        datasets: [{
          label: 'Cases',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      resolutionTrends: {
        labels: [],
        datasets: [
          {
            label: 'Resolved',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            stack: 'Stack 0',
          },
          {
            label: 'Pending',
            data: [],
            backgroundColor: 'rgba(255, 206, 86, 0.5)',
            stack: 'Stack 0',
          }
        ]
      },
      complexityData: {
        labels: [],
        datasets: [{
          label: 'Current Period',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          fill: true
        }]
      }
    };
    return this.fetchWithErrorHandling<ChartData>('/api/cases/charts', defaultChartData);
  }

  async getUnassignedCases(): Promise<Case[]> {
    return this.fetchWithErrorHandling<Case[]>('/api/cases/unassigned', []);
  }

  async getLawyers(): Promise<User[]> {
    return this.fetchWithErrorHandling<User[]>('/api/users/lawyers', []);
  }

  async assignCase(caseId: string, lawyerId: string, isReassignment = false): Promise<void> {
    try {
      const response = await fetch('/api/cases/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId, lawyerId, isReassignment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign case');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error assigning case:', error);
      throw error;
    }
  }

  async getAllCases(): Promise<Case[]> {
    return this.fetchWithErrorHandling<Case[]>('/api/cases', []);
  }

  async updateCase(caseId: string, data: Partial<Case>): Promise<void> {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update case');
      }

      const responseData = await response.json();
      if (responseData.error) {
        throw new Error(responseData.error);
      }
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  }
}

export const caseService = new CaseService(); 