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
  HiOutlineExclamationCircle
} from 'react-icons/hi';

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
  permissions: {
    permission: Permission;
  }[];
  users: {
    id: string;
    fullName: string;
    email: string;
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
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, Permission[]>>({});
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [newPermission, setNewPermission] = useState<NewPermission>({
    name: '',
    description: '',
    module: ''
  });
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showEditPermissionModal, setShowEditPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState<EditRole | null>(null);
  const [editingPermission, setEditingPermission] = useState<EditPermission | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: []
  });

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
      setPermissionsByModule(data.permissions);
    } catch (error) {
      console.error('Error loading access data:', error);
      toast.error(error.message || 'Failed to load access control data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPermission = async (roleId: string, permissionId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access/permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ASSIGN',
          roleId,
          permissionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign permission');
      }

      toast.success('Permission assigned successfully');
      await loadAccessData();
    } catch (error) {
      console.error('Error assigning permission:', error);
      toast.error(error.message || 'Failed to assign permission');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (roleId: string, permissionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access/permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'REMOVE',
          roleId,
          permissionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove permission');
      }

      toast.success('Permission removed successfully');
      loadAccessData();
    } catch (error) {
      console.error('Error removing permission:', error);
      toast.error('Failed to remove permission');
    }
  };

  const handleAddPermission = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access/permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CREATE',
          permission: newPermission
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create permission');
      }

      toast.success('Permission created successfully');
      setShowAddPermissionModal(false);
      setNewPermission({ name: '', description: '', module: '' });
      loadAccessData();
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error('Failed to create permission');
    }
  };

  const handleEditRole = async () => {
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      toast.success('Role updated successfully');
      setShowEditRoleModal(false);
      setEditingRole(null);
      loadAccessData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleEditPermission = async () => {
    try {
      if (!editingPermission) return;

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/access/permissions', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'UPDATE',
          permission: editingPermission
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update permission');
      }

      toast.success('Permission updated successfully');
      setShowEditPermissionModal(false);
      setEditingPermission(null);
      loadAccessData();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  const handleCreateRole = async () => {
    try {
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
        throw new Error('Failed to create role');
      }

      toast.success('Role created successfully');
      setShowAddRoleModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
      loadAccessData();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
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
        throw new Error('Failed to delete role');
      }

      toast.success('Role deleted successfully');
      setShowDeleteConfirmModal(false);
      setRoleToDelete(null);
      loadAccessData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  // Filter permissions based on search and module
  const filteredPermissions = Object.entries(permissionsByModule).reduce((acc, [module, permissions]) => {
    if (filterModule !== 'all' && module !== filterModule) return acc;
    
    const filtered = permissions.filter(permission => 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length > 0) {
      acc[module] = filtered;
    }
    return acc;
  }, {} as Record<string, Permission[]>);

  // Get unique modules for filter
  const modules = ['all', ...Object.keys(permissionsByModule)];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Access Control</h1>
        <div className="flex gap-4">
          <button
            onClick={() => loadAccessData()}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAddPermissionModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Permission
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          {modules.map(module => (
            <option key={module} value={module}>
              {module.charAt(0).toUpperCase() + module.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roles Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Roles</h2>
          {roles.map(role => (
            <div key={role.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium dark:text-white">{role.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{role.description}</p>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Users: {role.users.length}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRole(role.id)}
                    className="text-primary-500 hover:text-primary-600 dark:text-primary-400"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Permissions List */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 dark:text-white">Permissions:</h4>
                <div className="space-y-2">
                  {role.permissions.map(({ permission }) => (
                    <div key={permission.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <div>
                        <p className="text-sm font-medium dark:text-white">{permission.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{permission.module}</p>
                      </div>
                      <button
                        onClick={() => handleRemovePermission(role.id, permission.id)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Permissions by Module</h2>
          {Object.entries(filteredPermissions).map(([module, permissions]) => (
            <div key={module} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
              <h3 className="text-lg font-medium mb-2 dark:text-white">{module}</h3>
              <div className="space-y-2">
                {permissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div>
                      <p className="text-sm font-medium dark:text-white">{permission.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{permission.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignPermission(e.target.value, permission.id);
                            e.target.value = '';
                          }
                        }}
                        className="text-sm border rounded p-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Assign to role...</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Permission Modal */}
      {showAddPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Permission</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newPermission.name}
                  onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newPermission.description}
                  onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Module</label>
                <input
                  type="text"
                  value={newPermission.module}
                  onChange={(e) => setNewPermission({ ...newPermission, module: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddPermissionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPermission}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Add Permission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
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
                onClick={handleEditRole}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditPermissionModal && editingPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Permission</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={editingPermission.name}
                  onChange={(e) => setEditingPermission({ ...editingPermission, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={editingPermission.description}
                  onChange={(e) => setEditingPermission({ ...editingPermission, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Module</label>
                <input
                  type="text"
                  value={editingPermission.module}
                  onChange={(e) => setEditingPermission({ ...editingPermission, module: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowEditPermissionModal(false);
                  setEditingPermission(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPermission}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-white p-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Permissions</label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(permissionsByModule).map(([module, permissions]) => (
                    <div key={module}>
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">{module}</h4>
                      {permissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2 ml-4">
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
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm dark:text-gray-300">{permission.name}</span>
                        </label>
                      ))}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && roleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Confirm Delete</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setRoleToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRole(roleToDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 