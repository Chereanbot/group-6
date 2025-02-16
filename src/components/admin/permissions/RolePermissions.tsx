"use client";

import { useState } from 'react';
import { Permission, Role } from '@prisma/client';
import { toast } from 'react-hot-toast';
import {
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlineTrash
} from 'react-icons/hi';

interface RolePermissionsProps {
  roles: Role[];
  permissions: Permission[];
}

export default function RolePermissions({ roles, permissions }: RolePermissionsProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [updating, setUpdating] = useState(false);

  const handlePermissionToggle = async (permissionId: string) => {
    if (!selectedRole) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionId })
      });

      if (!response.ok) throw new Error('Failed to update role permissions');
      
      toast.success('Role permissions updated successfully');
    } catch (error) {
      console.error('Error updating role permissions:', error);
      toast.error('Failed to update role permissions');
    } finally {
      setUpdating(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const module = permission.module;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <div className="flex flex-wrap gap-2">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedRole?.id === role.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <HiOutlineShieldCheck className="w-5 h-5" />
              {role.name}
            </span>
          </button>
        ))}
      </div>

      {/* Permissions by Module */}
      {selectedRole && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
            <div
              key={module}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <h3 className="text-lg font-semibold mb-4">{module}</h3>
              <div className="space-y-3">
                {modulePermissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {permission.name}
                      </div>
                      {permission.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </div>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRole.permissions?.some(p => p.id === permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      disabled={updating}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!selectedRole && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Select a role to manage its permissions
        </div>
      )}
    </div>
  );
} 