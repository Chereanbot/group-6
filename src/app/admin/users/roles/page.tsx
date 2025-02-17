"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineUserGroup,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineExclamation,
  HiOutlineSearch
} from 'react-icons/hi';
import Modal from '@/components/admin/Modal';
import RoleForm from '@/components/admin/roles/RoleForm';
import { useRoles } from '@/hooks/useRoles';
import { toast } from 'react-hot-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  isEnabled?: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  createdAt: string;
  isDefault?: boolean;
  color?: string;
}

const RolesPage = () => {
  const {
    roles,
    permissions,
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole
  } = useRoles();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modules = Array.from(new Set(permissions.map(p => p.module)));

  const handleCreateRole = async (data: any) => {
    try {
      const result = await createRole({
        ...data,
        color: data.color || '#4F46E5',
        isDefault: data.isDefault || false
      });
      toast.success('Role created successfully');
      setShowRoleModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role');
    }
  };

  const handleUpdateRole = async (data: any) => {
    try {
      await updateRole(selectedRole!.id, {
        ...data,
        color: data.color || selectedRole?.color,
        isDefault: data.isDefault ?? selectedRole?.isDefault
      });
      toast.success('Role updated successfully');
      setSelectedRole(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isDefault) {
      toast.error('Cannot delete default role');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      try {
        await deleteRole(id);
        toast.success('Role deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete role');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="flex items-center">
          <HiOutlineExclamation className="w-6 h-6 text-red-500 mr-2" />
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user roles and access control
          </p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 
                focus:border-primary-500 w-64 dark:bg-gray-800 dark:border-gray-700"
            />
            <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 
              text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Roles</p>
              <h3 className="text-2xl font-bold">{roles.length}</h3>
            </div>
            <HiOutlineShieldCheck className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Permissions</p>
              <h3 className="text-2xl font-bold">{permissions.length}</h3>
            </div>
            <HiOutlineLockClosed className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Permission Modules</p>
              <h3 className="text-2xl font-bold">{modules.length}</h3>
            </div>
            <HiOutlineDocumentText className="w-8 h-8 text-primary-500" />
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: role.color || '#4F46E5' }}
                />
                <div>
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <span>{role.name}</span>
                    {role.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 
                        dark:bg-primary-900/20 dark:text-primary-300 rounded-full">
                        Default
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedRole(role)}
                  className="p-2 text-gray-400 hover:text-gray-600 
                    dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 
                    dark:hover:bg-gray-700"
                  title="Edit Role"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>
                {!role.isDefault && (
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-2 text-red-400 hover:text-red-600 
                      dark:hover:text-red-300 rounded-lg hover:bg-red-50 
                      dark:hover:bg-red-900/20"
                    title="Delete Role"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 
              dark:text-gray-400"
            >
              <div className="flex items-center">
                <HiOutlineUserGroup className="w-5 h-5 mr-2" />
                {role.usersCount} {role.usersCount === 1 ? 'User' : 'Users'}
              </div>
              <div className="flex items-center">
                <HiOutlineShieldCheck className="w-5 h-5 mr-2" />
                {role.permissions.length} {role.permissions.length === 1 ? 'Permission' : 'Permissions'}
              </div>
            </div>

            {/* Permissions Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {role.permissions.slice(0, 3).map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 text-xs rounded-full bg-primary-50 
                      text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                  >
                    {permission}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 
                    text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedRole(role)}
                className="w-full flex items-center justify-center space-x-2 px-4 
                  py-2 text-sm text-primary-600 hover:text-primary-700 
                  dark:text-primary-400 dark:hover:text-primary-300"
              >
                <HiOutlineCog className="w-5 h-5" />
                <span>Manage Permissions</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Permission Groups */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Available Permissions</h2>
          <div className="flex space-x-4">
            <select
              value={selectedModule || ''}
              onChange={(e) => setSelectedModule(e.target.value || null)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 
                focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">All Modules</option>
              {modules.map((module) => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-6">
          {modules
            .filter(module => !selectedModule || module === selectedModule)
            .map((module) => (
            <div key={module} className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white 
                flex items-center space-x-2"
              >
                <span>{module}</span>
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 
                  dark:bg-gray-700 dark:text-gray-300 rounded-full"
                >
                  {permissions.filter(p => p.module === module).length} permissions
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions
                  .filter(p => p.module === module)
                  .map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 rounded-lg 
                        border border-gray-200 dark:border-gray-700 hover:border-primary-500 
                        dark:hover:border-primary-500 transition-colors"
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

      {/* Create Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Create New Role"
        size="lg"
      >
        <RoleForm
          permissions={permissions}
          onSubmit={handleCreateRole}
          onCancel={() => setShowRoleModal(false)}
        />
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title="Edit Role"
        size="lg"
      >
        {selectedRole && (
          <RoleForm
            permissions={permissions}
            initialData={selectedRole}
            onSubmit={handleUpdateRole}
            onCancel={() => setSelectedRole(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default RolesPage; 