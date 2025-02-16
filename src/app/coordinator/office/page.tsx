"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineClock
} from 'react-icons/hi';

interface OfficeDetails {
  success: boolean;
  office: {
    id: string;
    name: string;
    location: string;
    type: string;
    status: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    capacity: number;
    coordinators: Array<{
      id: string;
      user: {
        fullName: string;
        email: string;
        phone: string;
      };
    }>;
  };
  coordinator: {
    id: string;
    type: string;
    specialties: string[];
    user: {
      fullName: string;
      email: string;
      phone: string;
    };
  };
}

export default function OfficePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [officeDetails, setOfficeDetails] = useState<OfficeDetails | null>(null);

  useEffect(() => {
    loadOfficeDetails();
  }, [session]);

  const loadOfficeDetails = async () => {
    try {
      const response = await fetch('/api/coordinator/office', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setOfficeDetails(data);
      } else {
        toast.error(data.error || 'Failed to load office details');
      }
    } catch (error) {
      console.error('Error loading office details:', error);
      toast.error('Failed to load office details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!officeDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Office details not found</p>
      </div>
    );
  }

  const { office, coordinator } = officeDetails;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Office Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <HiOutlineOfficeBuilding className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{office.name}</h1>
            <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
              <HiOutlineLocationMarker className="w-5 h-5 mr-2" />
              {office.location}
            </div>
          </div>
        </div>
      </div>

      {/* Office Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Coordinators"
          value={office.coordinators.length}
          icon={HiOutlineUsers}
        />
        <StatCard
          title="Office Status"
          value={office.status}
          icon={HiOutlineCalendar}
        />
        <StatCard
          title="Office Capacity"
          value={office.capacity}
          icon={HiOutlineClock}
        />
      </div>

      {/* Coordinators List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Office Coordinators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {office.coordinators.map((coordinator) => (
              <div
                key={coordinator.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <img
                  src="/avatar-placeholder.png"
                  alt={coordinator.user.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{coordinator.user.fullName}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlineMail className="w-4 h-4 mr-2" />
                      {coordinator.user.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlinePhone className="w-4 h-4 mr-2" />
                      {coordinator.user.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-primary-500" />
        </div>
      </div>
    </div>
  );
} 