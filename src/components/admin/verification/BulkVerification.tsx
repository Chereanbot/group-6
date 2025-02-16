"use client";

import { useState, useEffect } from 'react';
import { HiOutlineCheck, HiOutlineRefresh } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface PendingVerification {
  id: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export default function BulkVerification() {
  const [loading, setLoading] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingVerification[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/pending-verification');
      const data = await response.json();
      setPendingUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load pending verifications:', error);
      toast.error('Failed to load pending verifications');
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === pendingUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(pendingUsers.map(user => user.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkVerify = async (type: 'email' | 'phone', specificUserIds?: string[]) => {
    const userIdsToVerify = specificUserIds || Array.from(selectedUsers);
    
    if (userIdsToVerify.length === 0) {
      toast.error('Please select users to verify');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/bulk-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: userIdsToVerify,
          verificationType: type,
        }),
      });

      if (!response.ok) throw new Error('Verification failed');

      toast.success(`Successfully verified ${userIdsToVerify.length} user${userIdsToVerify.length > 1 ? 's' : ''}`);
      await loadPendingVerifications();
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Bulk verification failed:', error);
      toast.error('Failed to verify users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="animate-pulse h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex space-x-4">
            <div className="animate-pulse h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="animate-pulse h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!pendingUsers?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center">
          <HiOutlineCheck className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            All Users Verified
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There are no pending verifications at the moment.
          </p>
          <button
            onClick={loadPendingVerifications}
            className="mt-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <div className="flex items-center">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              Check Again
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Pending Verifications
        </h2>
        <button
          onClick={() => loadPendingVerifications()}
          className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <HiOutlineRefresh className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => handleBulkVerify('email', Array.from(selectedUsers))}
            disabled={loading || selectedUsers.size === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <HiOutlineCheck className="w-5 h-5 mr-2" />
                Verify Selected Emails
              </>
            )}
          </button>
          <button
            onClick={() => handleBulkVerify('phone', Array.from(selectedUsers))}
            disabled={loading || selectedUsers.size === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <HiOutlineCheck className="w-5 h-5 mr-2" />
                Verify Selected Phones
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === pendingUsers.length && pendingUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Phone Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Individual Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pendingUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.emailVerified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {user.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.phoneVerified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {user.phoneVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!user.emailVerified && (
                        <button
                          onClick={() => handleBulkVerify('email', [user.id])}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Verify Email"
                        >
                          <HiOutlineCheck className="w-5 h-5" />
                        </button>
                      )}
                      {!user.phoneVerified && user.phone && (
                        <button
                          onClick={() => handleBulkVerify('phone', [user.id])}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Verify Phone"
                        >
                          <HiOutlineCheck className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 