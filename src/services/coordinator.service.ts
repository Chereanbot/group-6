import { getAuthHeaders } from '@/utils/auth';

class CoordinatorService {
  async getAllCoordinators(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/coordinators${queryString ? `?${queryString}` : ''}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch coordinators');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch coordinators');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching coordinators:', error);
      throw error;
    }
  }

  async getCoordinatorById(id: string) {
    try {
      const response = await fetch(`/api/coordinators/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch coordinator');
      }

      return result;
    } catch (error) {
      console.error('Error fetching coordinator:', error);
      throw error;
    }
  }

  async createCoordinator(coordinatorData: any) {
    try {
      const response = await fetch('/api/coordinators', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(coordinatorData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create coordinator');
      }

      return result;
    } catch (error) {
      console.error('Error creating coordinator:', error);
      throw error;
    }
  }

  async updateCoordinator(id: string, coordinatorData: any) {
    try {
      const response = await fetch(`/api/coordinators/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(coordinatorData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update coordinator');
      }

      return result;
    } catch (error) {
      console.error('Error updating coordinator:', error);
      throw error;
    }
  }

  async deleteCoordinator(id: string) {
    try {
      const response = await fetch(`/api/coordinators/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete coordinator');
      }

      return result;
    } catch (error) {
      console.error('Error deleting coordinator:', error);
      throw error;
    }
  }

  async createAssignment(assignmentData: any) {
    try {
      const response = await fetch('/api/coordinator-assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(assignmentData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create assignment');
      }

      return result;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  async updateAssignment(id: string, assignmentData: any) {
    try {
      const response = await fetch(`/api/coordinator-assignments/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(assignmentData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update assignment');
      }

      return result;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(id: string) {
    try {
      const response = await fetch(`/api/coordinator-assignments/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete assignment');
      }

      return result;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }
}

export const coordinatorService = new CoordinatorService(); 