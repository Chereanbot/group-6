import { CoordinatorPerformance, PerformanceFilter, PerformanceMetric } from '@/types/coordinator';

export class PerformanceService {
  private baseUrl = '/api/coordinators/performance';

  async getPerformanceData(filter?: PerformanceFilter): Promise<CoordinatorPerformance[]> {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.metrics) params.append('metrics', filter.metrics.join(','));
      if (filter.coordinatorId) params.append('coordinatorId', filter.coordinatorId);
      if (filter.dateRange) {
        params.append('startDate', filter.dateRange.start.toISOString());
        params.append('endDate', filter.dateRange.end.toISOString());
      }
    }

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    return response.json();
  }

  async generatePerformanceReport(coordinatorId: string, period: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${coordinatorId}/report?period=${period}`);
    return response.blob();
  }

  async getPerformanceMetrics(coordinatorId: string): Promise<Record<PerformanceMetric, number>> {
    const response = await fetch(`${this.baseUrl}/${coordinatorId}/metrics`);
    return response.json();
  }

  async addPerformanceNote(
    coordinatorId: string, 
    metric: PerformanceMetric, 
    note: string
  ): Promise<void> {
    await fetch(`${this.baseUrl}/${coordinatorId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric, note })
    });
  }

  async getTeamPerformance(): Promise<{
    averages: Record<PerformanceMetric, number>;
    topPerformers: Array<{
      coordinatorId: string;
      metric: PerformanceMetric;
      value: number;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/team`);
    return response.json();
  }
} 