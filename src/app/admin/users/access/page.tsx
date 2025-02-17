"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlineCheck,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlinePencil,
  HiOutlineExclamationCircle,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineX
} from 'react-icons/hi';
import { UserRoleEnum, PermissionModule, DefaultPermissions } from '@/types/security.types';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: {
    permission: Permission;
  }[];
  users: {
    id: string;
    fullName: string;
    email: string;
    userRole: UserRoleEnum;
  }[];
}

interface NewPermission {
  name: string;
  description: string;
  module: string;
}

interface EditRole {
  id: string;
  name: string;
  description: string;
}

interface EditPermission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

export default function AccessControlPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');

  useEffect(() => {
    loadAccessData();
  }, []);

  const loadAccessData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/access', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load access data');
      }

      const data = await response.json();
      setRoles(data.roles);
      setPermissions(data.permissions);
    } catch (error) {
      console.error('Error loading access data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load access control data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!newRole.name.trim()) {
        toast.error('Role name is required');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access/roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
      }

      toast.success('Role created successfully');
      setShowAddRoleModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
      loadAccessData();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (!editingRole) return;

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access/roles', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingRole.id,
          name: editingRole.name,
          description: editingRole.description,
          permissions: editingRole.permissions.map(p => p.permission.id)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      toast.success('Role updated successfully');
      setShowEditRoleModal(false);
      setEditingRole(null);
      loadAccessData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      if (!confirm('Are you sure you want to delete this role?')) return;

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access/roles', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: roleId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      toast.success('Role deleted successfully');
      loadAccessData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete role');
    }
  };

  const handleUpdatePermissions = async (roleId: string, permissionId: string, action: 'ASSIGN' | 'REMOVE') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: action === 'ASSIGN' ? 'ASSIGN_PERMISSION' : 'REMOVE_PERMISSION',
          roleId,
          permissionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update permissions');
      }

      toast.success(`Permission ${action.toLowerCase()}ed successfully`);
      loadAccessData();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update permissions');
    }
  };

  const filteredPermissions = Object.entries(permissions).reduce((acc, [module, perms]) => {
    if (filterModule === 'all' || module === filterModule) {
      const filtered = perms.filter(permission =>
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (filtered.length > 0) {
      acc[module] = filtered;
      }
    }
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Control</h1>
          <button
          onClick={() => setShowAddRoleModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2"
          >
            <HiOutlinePlus className="w-5 h-5" />
          <span>Add Role</span>
          </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permissions..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div className="sm:w-48">
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
            <option value="all">All Modules</option>
            {Object.keys(permissions).map((module) => (
            <option key={module} value={module}>
                {module}
            </option>
          ))}
        </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roles Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Roles</h2>
          {roles.map(role => (
            <div key={role.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium dark:text-white">{role.name}</h3>
                    {role.isSystemRole && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        System Role
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{role.description}</p>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Users: {role.users.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!role.isSystemRole && (
                    <>
                  <button
                        onClick={() => {
                          setEditingRole(role);
                          setShowEditRoleModal(true);
                        }}
                    className="text-primary-500 hover:text-primary-600 dark:text-primary-400"
                        title="Edit Role"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400"
                        title="Delete Role"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    title="Toggle Permissions"
                  >
                    {selectedRole === role.id ? (
                      <HiOutlineX className="w-5 h-5" />
                    ) : (
                      <HiOutlineShieldCheck className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {selectedRole === role.id && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</h4>
                  <div className="space-y-2">
                    {Object.entries(filteredPermissions).map(([module, modulePermissions]) => (
                      <div key={module} className="border dark:border-gray-700 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{module}</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {modulePermissions.map(permission => {
                            const hasPermission = role.permissions.some(
                              p => p.permission.id === permission.id
                            );
                            return (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                              >
                                <div>
                                  <p className="text-sm font-medium dark:text-white">
                                    {permission.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {permission.description}
                                  </p>
                                </div>
                                {!role.isSystemRole && (
                                  <button
                                    onClick={() =>
                                      handleUpdatePermissions(
                                        role.id,
                                        permission.id,
                                        hasPermission ? 'REMOVE' : 'ASSIGN'
                                      )
                                    }
                                    className={`p-1 rounded ${
                                      hasPermission
                                        ? 'text-green-600 hover:text-green-700 dark:text-green-400'
                                        : 'text-gray-400 hover:text-gray-500 dark:text-gray-500'
                                    }`}
                                  >
                                    <HiOutlineCheck className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          ))}
        </div>

        {/* Permissions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Available Permissions</h2>
          <div className="space-y-6">
            {Object.entries(filteredPermissions).map(([module, modulePermissions]) => (
              <div key={module} className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {module}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modulePermissions.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-shrink-0">
                        <HiOutlineLockClosed className="w-5 h-5 text-gray-400" />
                      </div>
        <div>
                        <p className="text-sm font-medium">{permission.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Initial Permissions
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md dark:border-gray-600">
                  {Object.entries(permissions).map(([module, modulePermissions]) => (
                    <div key={module} className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium mb-2">{module}</h4>
                      <div className="space-y-2">
                        {modulePermissions.map(permission => (
                          <label key={permission.id} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={newRole.permissions.includes(permission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRole({
                                  ...newRole,
                                  permissions: [...newRole.permissions, permission.id]
                                });
                              } else {
                                setNewRole({
                                  ...newRole,
                                  permissions: newRole.permissions.filter(id => id !== permission.id)
                                });
                              }
                            }}
                              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <div>
                              <p className="text-sm">{permission.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {permission.description}
                              </p>
                            </div>
                        </label>
                      ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddRoleModal(false);
                  setNewRole({ name: '', description: '', permissions: [] });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowEditRoleModal(false);
                  setEditingRole(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 