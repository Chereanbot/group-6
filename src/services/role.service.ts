import { api } from '@/lib/api';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  usersCount: number;
  createdAt: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleDto extends CreateRoleDto {
  id: string;
}

class RoleService {
  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getAllRoles() {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch('/api/roles', {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch roles');
      }

      const data = await response.json();
      return { data: data.roles || [], total: data.total };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return { data: [], total: 0 };
    }
  }

  async getAllPermissions() {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch('/api/permissions', {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch permissions');
      }

      const data = await response.json();
      return { data: data.permissions || [], total: data.total };
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return { data: [], total: 0 };
    }
  }

  async getRoleById(id: string): Promise<Role> {
    return await api.get(`/roles/${id}`);
  }

  async createRole(data: CreateRoleDto): Promise<Role> {
    return await api.post('/roles', data);
  }

  async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    return await api.put(`/roles/${id}`, data);
  }

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  }

  async assignRoleToUsers(roleId: string, userIds: string[]): Promise<void> {
    await api.post(`/roles/${roleId}/assign`, { userIds });
  }

  async removeRoleFromUsers(roleId: string, userIds: string[]): Promise<void> {
    await api.post(`/roles/${roleId}/remove`, { userIds });
  }

  async assignPermission(roleId: string, permissionId: string) {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch('/api/admin/access/permissions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'ASSIGN',
          roleId,
          permissionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign permission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning permission:', error);
      throw error;
    }
  }

  async removePermission(roleId: string, permissionId: string) {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch('/api/admin/access/permissions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'REMOVE',
          roleId,
          permissionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove permission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing permission:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService(); 