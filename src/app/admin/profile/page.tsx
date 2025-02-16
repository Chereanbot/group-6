"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { HiOutlineCamera, HiOutlineSave, HiOutlineX } from 'react-icons/hi';

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    bio: '',
    specializations: [] as string[],
    languages: [] as string[],
    availability: true,
    officeHours: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
        bio: user.bio || '',
        specializations: user.specializations || [],
        languages: user.languages || [],
        availability: user.availability || true,
        officeHours: user.officeHours || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          data: {
            ...formData,
            // Only include password if it's being changed
            ...(formData.password && { password: formData.password }),
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully');
        checkAuth(); // Refresh user data
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user?.id || '');

      const response = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Avatar updated successfully');
        checkAuth(); // Refresh user data
      } else {
        toast.error(data.error || 'Failed to update avatar');
      }
    } catch (error) {
      console.error('Avatar update error:', error);
      toast.error('An error occurred while updating avatar');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 
                  shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HiOutlineCamera className="w-5 h-5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 
                  focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 
                  focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 
                  dark:bg-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 
                  focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 
                focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Password Change */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 
                  focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 
                  focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 
                dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 