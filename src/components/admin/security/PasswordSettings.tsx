"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordHistory: number;
  expiryDays: number;
}

export default function PasswordSettings() {
  const [policy, setPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordHistory: 3,
    expiryDays: 90
  });

  const handleSave = async () => {
    try {
      // API call to update password policy
      toast.success('Password policy updated successfully');
    } catch (error) {
      toast.error('Failed to update password policy');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Password Requirements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Minimum Length
          </label>
          <input
            type="number"
            value={policy.minLength}
            onChange={(e) => setPolicy({ ...policy, minLength: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password History
          </label>
          <input
            type="number"
            value={policy.passwordHistory}
            onChange={(e) => setPolicy({ ...policy, passwordHistory: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password Expiry (days)
          </label>
          <input
            type="number"
            value={policy.expiryDays}
            onChange={(e) => setPolicy({ ...policy, expiryDays: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={policy.requireUppercase}
            onChange={(e) => setPolicy({ ...policy, requireUppercase: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Require uppercase letters
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={policy.requireLowercase}
            onChange={(e) => setPolicy({ ...policy, requireLowercase: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Require lowercase letters
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={policy.requireNumbers}
            onChange={(e) => setPolicy({ ...policy, requireNumbers: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Require numbers
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={policy.requireSpecialChars}
            onChange={(e) => setPolicy({ ...policy, requireSpecialChars: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Require special characters
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
} 