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
  HiOutlineCog
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
}

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  createdAt: string;
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

  const handleCreateRole = async (data: any) => {
    try {
      await createRole(data);
      setShowRoleModal(false);
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleUpdateRole = async (data: any) => {
    try {
      await updateRole(selectedRole!.id, data);
      setSelectedRole(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id);
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user roles and access control
          </p>
        </div>
        <button
          onClick={() => setShowPermissionModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 
            text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>Create Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{role.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {role.description}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedRole(role)}
                  className="p-2 text-gray-400 hover:text-gray-600 
                    dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 
                    dark:hover:bg-gray-700"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="p-2 text-red-400 hover:text-red-600 
                    dark:hover:text-red-300 rounded-lg hover:bg-red-50 
                    dark:hover:bg-red-900/20"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 
              dark:text-gray-400"
            >
              <div className="flex items-center">
                <HiOutlineUserGroup className="w-5 h-5 mr-2" />
                {role.usersCount} Users
              </div>
              <div className="flex items-center">
                <HiOutlineShieldCheck className="w-5 h-5 mr-2" />
                {role.permissions.length} Permissions
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
        <h2 className="text-lg font-semibold mb-4">Available Permissions</h2>
        <div className="space-y-6">
          {Array.from(new Set(permissions.map(p => p.module))).map((module) => (
            <div key={module} className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {module}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions
                  .filter(p => p.module === module)
                  .map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 rounded-lg 
                        border border-gray-200 dark:border-gray-700"
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
            initialData={selectedRole}
            permissions={permissions}
            onSubmit={handleUpdateRole}
            onCancel={() => setSelectedRole(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default RolesPage; 