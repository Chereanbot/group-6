import { 
  Coordinator, 
  CoordinatorType, 
  CoordinatorStatus,
  Qualification,
  CoordinatorAssignment,
  CoordinatorPerformance,
  PerformanceMetric
} from '@/types/coordinator';

export class CoordinatorService {
  private baseUrl = '/api/coordinators';

  // Basic CRUD Operations
  async getAllCoordinators(): Promise<Coordinator[]> {
    const response = await fetch(this.baseUrl);
    return response.json();
  }

  async getCoordinatorById(id: string): Promise<Coordinator> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  }

  async createCoordinator(data: {
    userId: string;
    type: CoordinatorType;
    officeId: string;
    specialties: string[];
    startDate: Date;
    endDate?: Date;
  }): Promise<Coordinator> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateCoordinator(id: string, data: Partial<Coordinator>): Promise<Coordinator> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Status Management
  async updateStatus(id: string, status: CoordinatorStatus): Promise<void> {
    await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  }

  // Qualification Management
  async addQualification(coordinatorId: string, data: Omit<Qualification, 'id' | 'coordinatorId'>): Promise<Qualification> {
    const response = await fetch(`${this.baseUrl}/${coordinatorId}/qualifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateQualification(qualificationId: string, data: Partial<Qualification>): Promise<Qualification> {
    const response = await fetch(`${this.baseUrl}/qualifications/${qualificationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Assignment Management
  async createAssignment(data: {
    coordinatorId: string;
    projectId?: string;
    startDate: Date;
    endDate?: Date;
    notes?: string;
  }): Promise<CoordinatorAssignment> {
    const response = await fetch(`${this.baseUrl}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateAssignment(assignmentId: string, data: Partial<CoordinatorAssignment>): Promise<CoordinatorAssignment> {
    const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Performance Tracking
  async addPerformanceRecord(data: {
    coordinatorId: string;
    metric: PerformanceMetric;
    value: number;
    period: string;
    notes?: string;
  }): Promise<CoordinatorPerformance> {
    const response = await fetch(`${this.baseUrl}/performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getPerformanceHistory(coordinatorId: string, metric?: PerformanceMetric): Promise<CoordinatorPerformance[]> {
    const url = new URL(`${this.baseUrl}/${coordinatorId}/performance`);
    if (metric) url.searchParams.append('metric', metric);
    const response = await fetch(url.toString());
    return response.json();
  }

  // Document Management
  async uploadDocument(coordinatorId: string, file: File, type: string): Promise<CoordinatorDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseUrl}/${coordinatorId}/documents`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  async getDocuments(coordinatorId: string): Promise<CoordinatorDocument[]> {
    const response = await fetch(`${this.baseUrl}/${coordinatorId}/documents`);
    return response.json();
  }

  // Analytics and Reports
  async getPerformanceMetrics(coordinatorId: string): Promise<{
    casesHandled: number;
    resolutionRate: number;
    clientSatisfaction: number;
    averageResponseTime: number;
    documentationQuality: number;
  }> {
    const response = await fetch(`${this.baseUrl}/${coordinatorId}/metrics`);
    return response.json();
  }

  async generatePerformanceReport(coordinatorId: string, period: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${coordinatorId}/report?period=${period}`);
    return response.blob();
  }
} 