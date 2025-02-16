import { useState, useEffect } from 'react';
import { HiOutlineShieldCheck } from 'react-icons/hi';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface RoleFormProps {
  initialData?: {
    name: string;
    description: string;
    permissions: string[];
  };
  permissions: Permission[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const RoleForm = ({ initialData, permissions, onSubmit, onCancel }: RoleFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Role Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
              dark:border-gray-700 dark:bg-gray-800"
            placeholder="Enter role name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
              dark:border-gray-700 dark:bg-gray-800"
            placeholder="Enter role description"
            rows={3}
          />
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Permissions</h3>
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
            <div key={module} className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {module}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modulePermissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border 
                      border-gray-200 dark:border-gray-700 cursor-pointer 
                      hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium">{permission.name}</p>
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

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t 
        border-gray-200 dark:border-gray-700"
      >
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 
            dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
            rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-500 
            hover:bg-primary-600 rounded-lg transition-colors"
        >
          {initialData ? 'Update Role' : 'Create Role'}
        </button>
      </div>
    </form>
  );
};

export default RoleForm; 