import { CoordinatorAssignment, AssignmentFilter } from '@/types/coordinator';

export class AssignmentService {
  private baseUrl = '/api/coordinators/assignments';

  async getAssignments(filter?: AssignmentFilter): Promise<CoordinatorAssignment[]> {
    const params = new URLSearchParams();
    if (filter) {
      if (filter.status) params.append('status', filter.status.join(','));
      if (filter.coordinatorId) params.append('coordinatorId', filter.coordinatorId);
      if (filter.projectId) params.append('projectId', filter.projectId);
      if (filter.dateRange) {
        params.append('startDate', filter.dateRange.start.toISOString());
        params.append('endDate', filter.dateRange.end.toISOString());
      }
    }

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    return response.json();
  }

  async bulkAssign(assignments: { coordinatorId: string; projectId: string }[]): Promise<void> {
    await fetch(`${this.baseUrl}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments })
    });
  }

  async updateAssignmentStatus(assignmentId: string, status: AssignmentStatus): Promise<void> {
    await fetch(`${this.baseUrl}/${assignmentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }

  async getAssignmentHistory(coordinatorId: string): Promise<CoordinatorAssignment[]> {
    const response = await fetch(`${this.baseUrl}/history/${coordinatorId}`);
    return response.json();
  }
} 