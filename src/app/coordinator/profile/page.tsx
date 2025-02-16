"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  HiOutlineCamera,
  HiOutlineOfficeBuilding,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineUserCircle
} from 'react-icons/hi';

interface CoordinatorProfile {
  user: {
    id: string;
    email: string;
    phone: string;
    userRole: string;
    avatar: string;
  };
  coordinator: {
    id: string;
    type: string;
    office: {
      id: string;
      name: string;
    };
  };
}

export default function CoordinatorProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoordinatorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    type: '',
    officeId: '',
    officeName: ''
  });

  useEffect(() => {
    loadProfile();
  }, [session]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/coordinator/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setFormData({
          phone: data.profile.user.phone,
          type: data.profile.coordinator.type,
          officeId: data.profile.coordinator.office.id,
          officeName: data.profile.coordinator.office.name
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/coordinator/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully');
        setProfile(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            phone: formData.phone
          },
          coordinator: {
            ...prev.coordinator,
            type: formData.type,
            office: {
              id: formData.officeId,
              name: formData.officeName
            }
          }
        } : null);
        setIsEditing(false);
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/coordinator/profile/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Avatar updated successfully');
        setProfile(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            avatar: data.avatar
          }
        } : null);
      } else {
        toast.error(data.error || 'Failed to update avatar');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={profile.user.avatar || '/avatar-placeholder.png'}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 p-1 bg-white dark:bg-gray-700 rounded-full 
              shadow-lg cursor-pointer">
              <HiOutlineCamera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Coordinator Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {profile.coordinator.type}
            </p>
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <HiOutlineOfficeBuilding className="w-4 h-4 mr-1" />
              {profile.coordinator.office.name}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Profile Details</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-500 
              rounded-lg hover:bg-primary-600"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Coordinator Type</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Office Name</label>
              <input
                type="text"
                value={formData.officeName}
                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg 
                  hover:bg-primary-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={HiOutlineUserCircle}
                label="User ID"
                value={profile.user.id}
              />
              <InfoItem
                icon={HiOutlineMail}
                label="Email"
                value={profile.user.email}
              />
              <InfoItem
                icon={HiOutlinePhone}
                label="Phone"
                value={profile.user.phone}
              />
              <InfoItem
                icon={HiOutlineIdentification}
                label="Role"
                value={profile.user.userRole}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5 text-gray-400" />
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}