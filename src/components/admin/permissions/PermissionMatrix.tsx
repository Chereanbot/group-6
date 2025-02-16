"use client";

import { useState } from 'react';
import { Permission, Role } from '@prisma/client';
import { toast } from 'react-hot-toast';

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
}

export default function PermissionMatrix({ roles, permissions }: PermissionMatrixProps) {
  const [updating, setUpdating] = useState(false);

  const handlePermissionToggle = async (roleId: string, permissionId: string) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/roles/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId, permissionId })
      });

      if (!response.ok) throw new Error('Failed to update permission');
      
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Permission
            </th>
            {roles.map(role => (
              <th
                key={role.id}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {permissions.map(permission => (
            <tr key={permission.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {permission.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {permission.description}
                </div>
              </td>
              {roles.map(role => (
                <td key={`${role.id}-${permission.id}`} className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={role.permissions?.some(p => p.id === permission.id)}
                    onChange={() => handlePermissionToggle(role.id, permission.id)}
                    disabled={updating}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 