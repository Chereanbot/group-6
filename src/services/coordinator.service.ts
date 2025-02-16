import { getAuthHeaders } from '@/utils/auth';

class CoordinatorService {
  async getAllCoordinators() {
    try {
      const response = await fetch('/api/coordinators', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch coordinators');
      }

      const data = await response.json();
      return { data: data.coordinators || [], total: data.total };
    } catch (error) {
      console.error('Error fetching coordinators:', error);
      return { data: [], total: 0 };
    }
  }

  async getCoordinatorById(id: string) {
    try {
      const response = await fetch(`/api/coordinators/${id}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch coordinator');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching coordinator:', error);
      throw error;
    }
  }

  async createCoordinator(coordinatorData: any) {
    const response = await fetch('/api/coordinators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coordinatorData)
    });
    if (!response.ok) {
      throw new Error('Failed to create coordinator');
    }
    return response.json();
  }

  async updateCoordinator(id: string, coordinatorData: any) {
    const response = await fetch(`/api/coordinators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coordinatorData)
    });
    if (!response.ok) {
      throw new Error('Failed to update coordinator');
    }
    return response.json();
  }

  async deleteCoordinator(id: string) {
    const response = await fetch(`/api/coordinators/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete coordinator');
    }
    return response.json();
  }

  async createAssignment(assignmentData: any) {
    const response = await fetch('/api/coordinator-assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    if (!response.ok) {
      throw new Error('Failed to create assignment');
    }
    return response.json();
  }

  async updateAssignment(id: string, assignmentData: any) {
    const response = await fetch(`/api/coordinator-assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assignmentData)
    });
    if (!response.ok) {
      throw new Error('Failed to update assignment');
    }
    return response.json();
  }

  async deleteAssignment(id: string) {
    const response = await fetch(`/api/coordinator-assignments/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete assignment');
    }
    return response.json();
  }
}

export const coordinatorService = new CoordinatorService(); 