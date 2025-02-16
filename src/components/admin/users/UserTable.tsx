"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import { User, ApiResponse } from '@/types';
import EditUserModal from './EditUserModal';
import SendSMSModal from './SendSMSModal';
import { debounce } from 'lodash';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLockClosed,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineDotsVertical,
  HiOutlineClock,
  HiOutlineBan,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineMail,
  HiOutlineRefresh,
  HiOutlineDocumentDownload,
  HiOutlineChatAlt,
  HiOutlinePhone,
  HiOutlineDownload,
  HiOutlineDocumentText,
  HiOutlineTable,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDoubleRight,
} from 'react-icons/hi';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UserTableProps {
  users: User[];
  onRefresh?: () => void;
}

export default function UserTable({ users: initialUsers, onRefresh = () => {} }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [selectedUserForSMS, setSelectedUserForSMS] = useState<User | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkExportMenu, setShowBulkExportMenu] = useState(false);

  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'all' | 'name' | 'email' | 'phone' | 'role'>('all');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: initialUsers.length,
    page: 1,
    limit: 10,
    totalPages: Math.ceil(initialUsers.length / 10),
    hasNextPage: initialUsers.length > 10,
    hasPreviousPage: false
  });

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query: string, field: string, page: number) => {
      try {
        setLoading(true);
        const headers = getAuthHeader();
        
        // If no auth headers, don't proceed with the request
        if (!headers.Authorization) {
          return;
        }

        const params = new URLSearchParams({
          query,
          field,
          page: page.toString(),
          limit: pagination.limit.toString()
        });

        console.log('Searching with params:', params.toString());
        
        const response = await fetch(`/api/users/search?${params}`, {
          headers
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Search response:', data);

        if (data.success) {
          setUsers(data.data.users);
          setPagination(data.data.pagination);
        } else {
          throw new Error(data.error || 'Failed to search users');
        }
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to search users');
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  // Effect to trigger search
  useEffect(() => {
    debouncedSearch(searchQuery, searchField, pagination.page);
  }, [searchQuery, searchField, pagination.page]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found');
      return {};
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const refreshData = () => {
    try {
      onRefresh?.();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUserForEdit(user);
    setEditModalOpen(true);
    setShowActionMenu(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User deleted successfully');
        refreshData();
        return;
      }
      
      toast.error(data.error || 'Failed to delete user');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Something went wrong! Please try again later.');
    }
  };

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      const response = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({
          id: userId,
          status
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User status updated successfully');
        refreshData();
        return;
      }
      
      toast.error(data.error || 'Failed to update user status');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Something went wrong! Please try again later.');
    }
  };

  const handleRoleChange = async (userId: string, userRole: UserRoleEnum) => {
    try {
      const response = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify({
          id: userId,
          userRole
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User role updated successfully');
        refreshData();
        return;
      }
      
      toast.error(data.error || 'Failed to update user role');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Something went wrong! Please try again later.');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const newPassword = prompt('Enter new password:');
      if (!newPassword) return;

      const response = await fetch(`/api/users`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({
          userId,
          newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password reset successfully');
        refreshData();
        return;
      }
      
      toast.error(data.error || 'Failed to reset password');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Something went wrong! Please try again later.');
    }
  };

  const handleSendVerification = async (userId: string, type: 'email' | 'phone') => {
    try {
      const response = await fetch('/api/users/verify', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ userId, type, directVerify: true }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${type === 'email' ? 'Email' : 'Phone'} verified successfully`);
        refreshData();
      } else {
        toast.error(data.error || `Failed to verify ${type}`);
      }
    } catch (error) {
      console.error(`Error verifying ${type}:`, error);
      toast.error(`Failed to verify ${type}`);
    }
  };

  const handleExportUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/export?userId=${userId}`, {
        headers: getAuthHeader()
      });
      const data = await response.json();

      if (data.success) {
        // Create and download file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-${userId}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('User data exported successfully');
        return;
      }
      
      toast.error(data.error || 'Failed to export user data');
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast.error('Something went wrong! Please try again later.');
    }
  };

  const handleSendSMS = (user: User) => {
    setSelectedUserForSMS(user);
    setShowSMSModal(true);
    setShowActionMenu(null);
  };

  const handleSendEmail = async (userId: string, email: string) => {
    try {
      const subject = prompt('Enter email subject:');
      if (!subject) return;

      const message = prompt('Enter email message:');
      if (!message) return;

      const response = await fetch('/api/messages/email', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          userId,
          email,
          subject,
          message
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email sent successfully');
        return;
      }
      
      toast.error(data.error || 'Failed to send email');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Something went wrong! Please try again later.');
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-black dark:bg-purple-900/40 dark:text-purple-200';
      case 'ADMIN':
        return 'bg-blue-100 text-black dark:bg-blue-900/40 dark:text-blue-200';
      case 'LAWYER':
        return 'bg-green-100 text-black dark:bg-green-900/40 dark:text-green-200';
      case 'CLIENT':
        return 'bg-yellow-100 text-black dark:bg-yellow-900/40 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-black dark:bg-gray-900/40 dark:text-gray-200';
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const statusColors = {
      ACTIVE: 'bg-green-100 text-black dark:bg-green-900/40 dark:text-green-200',
      INACTIVE: 'bg-gray-100 text-black dark:bg-gray-900/40 dark:text-gray-200',
      SUSPENDED: 'bg-yellow-100 text-black dark:bg-yellow-900/40 dark:text-yellow-200',
      BANNED: 'bg-red-100 text-black dark:bg-red-900/40 dark:text-red-200'
    };
    return statusColors[status];
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) return;

    try {
      const promises = selectedUsers.map(userId =>
        fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeader()
        })
      );

      await Promise.all(promises);
      toast.success('Selected users deleted successfully');
      setSelectedUsers([]);
      refreshData();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error('Failed to delete some users');
    }
  };

  const handleBulkExport = async (format: 'json' | 'csv' | 'pdf' | 'excel') => {
    try {
      const response = await fetch('/api/users/export', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          userIds: selectedUsers,
          format
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Users exported as ${format.toUpperCase()}`);
      setShowBulkExportMenu(false);
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          No users found for the selected criteria
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as any)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="role">Role</option>
            </select>
          </div>
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Found {pagination.total} {pagination.total === 1 ? 'user' : 'users'}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedUsers.length} users selected
            </span>
            <button
              onClick={() => setSelectedUsers([])}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowBulkExportMenu(!showBulkExportMenu)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
              >
                <HiOutlineDownload className="w-5 h-5" />
                <span>Export</span>
              </button>
              
              {showBulkExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleBulkExport('json')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <HiOutlineDocumentText className="w-4 h-4 mr-2" />
                      Export as JSON
                    </button>
                    <button
                      onClick={() => handleBulkExport('csv')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <HiOutlineTable className="w-4 h-4 mr-2" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleBulkExport('excel')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <HiOutlineDocumentDownload className="w-4 h-4 mr-2" />
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleBulkExport('pdf')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <HiOutlineDocumentText className="w-4 h-4 mr-2" />
                      Export as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
            >
              <HiOutlineTrash className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Verification
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Password
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                        alt={user.fullName}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.userRole)}`}>
                    {user.userRole}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.phone ? (
                      <>
                        <span className="text-sm text-gray-900 dark:text-white">{user.phone}</span>
                        <button
                          onClick={() => handleSendSMS(user)}
                          className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Send SMS"
                        >
                          <HiOutlinePhone className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No phone number
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                    {user.status === 'BANNED' ? (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <HiOutlineBan className="w-4 h-4 mr-1" />
                        Banned
                      </span>
                    ) : (
                      user.status
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm mr-2">Email:</span>
                      {user.emailVerified ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <HiOutlineCheck className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendVerification(user.id, 'email')}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                        >
                          <HiOutlineMail className="w-4 h-4 mr-1" />
                          Verify Email
                        </button>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">Phone:</span>
                      {user.phoneVerified ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <HiOutlineCheck className="w-4 h-4 mr-1" />
                          Verified
                        </span>
                      ) : user.phone ? (
                        <button
                          onClick={() => handleSendVerification(user.id, 'phone')}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                        >
                          <HiOutlinePhone className="w-4 h-4 mr-1" />
                          Verify Phone
                        </button>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 italic">
                          No phone
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {user.password ? (
                        <>
                          {showPasswords[user.id] ? user.password : '••••••••'}
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            {showPasswords[user.id] ? (
                              <HiOutlineEyeOff className="w-5 h-5" />
                            ) : (
                              <HiOutlineEye className="w-5 h-5" />
                            )}
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic">No password set</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3 relative">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title="Edit User"
                    >
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => setShowActionMenu(user.id)}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      title="More Actions"
                    >
                      <HiOutlineDotsVertical className="w-5 h-5" />
                    </button>

                    {showActionMenu === user.id && (
                      <div 
                        ref={actionMenuRef}
                        className="absolute right-0 mt-8 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleEdit(user)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlinePencil className="w-4 h-4 mr-2" />
                            Edit User
                          </button>

                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                            Reset Password
                          </button>

                          <button
                            onClick={() => handleSendVerification(user.id, 'email')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            disabled={user.emailVerified}
                          >
                            <HiOutlineMail className="w-4 h-4 mr-2" />
                            Send Verification Email
                          </button>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                          <div className="px-4 py-2">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Change Role
                            </label>
                            <select
                              onChange={(e) => handleRoleChange(user.id, e.target.value as UserRoleEnum)}
                              value={user.userRole}
                              className="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            >
                              <option value="SUPER_ADMIN">Super Admin</option>
                              <option value="ADMIN">Admin</option>
                              <option value="LAWYER">Lawyer</option>
                              <option value="CLIENT">Client</option>
                            </select>
                          </div>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                          <button
                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlineCheck className="w-4 h-4 mr-2" />
                            Activate User
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlineClock className="w-4 h-4 mr-2" />
                            Suspend User
                          </button>
                          
                          <button
                            onClick={() => handleStatusChange(user.id, 'BANNED')}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlineBan className="w-4 h-4 mr-2" />
                            Ban User
                          </button>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                          <button
                            onClick={() => handleSendEmail(user.id, user.email)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlineMail className="w-4 h-4 mr-2" />
                            Send Email
                          </button>

                          <button
                            onClick={() => handleSendSMS(user)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            disabled={!user.phone}
                            title={user.phone ? 'Send SMS' : 'No phone number available'}
                          >
                            <HiOutlinePhone className="w-4 h-4 mr-2" />
                            Send SMS
                            {!user.phone && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                (No phone)
                              </span>
                            )}
                          </button>

                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                          <button
                            onClick={() => handleExportUserData(user.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlineDocumentDownload className="w-4 h-4 mr-2" />
                            Export User Data
                          </button>

                          <button
                            onClick={() => handleDelete(user.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <HiOutlineTrash className="w-4 h-4 mr-2" />
                            Delete User
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                >
                  <span className="sr-only">First</span>
                  <HiOutlineChevronDoubleLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                >
                  <span className="sr-only">Previous</span>
                  <HiOutlineChevronLeft className="h-5 w-5" />
                </button>
                {/* Page Numbers */}
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === pagination.page;
                  
                  // Show current page and 2 pages before and after
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages ||
                    (pageNumber >= pagination.page - 2 && pageNumber <= pagination.page + 2)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-500 dark:text-primary-200'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (
                    (pageNumber === 2 && pagination.page > 4) ||
                    (pageNumber === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 3)
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                >
                  <span className="sr-only">Next</span>
                  <HiOutlineChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                >
                  <span className="sr-only">Last</span>
                  <HiOutlineChevronDoubleRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <EditUserModal
        user={selectedUserForEdit}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        onUpdate={() => {
          refreshData();
          setEditModalOpen(false);
          setSelectedUserForEdit(null);
        }}
      />

      <SendSMSModal
        isOpen={showSMSModal}
        onClose={() => {
          setShowSMSModal(false);
          setSelectedUserForSMS(null);
        }}
        user={selectedUserForSMS}
      />
    </>
  );
} 