"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineRefresh
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface OfficeData {
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
      email: string;
      fullName: string;
      userRole: string;
      phone: string;
    };
  };
}

export default function OfficeDashboard() {
  const router = useRouter();
  const [officeData, setOfficeData] = useState<OfficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOfficeData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/coordinator/office', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('auth-token=')?.[1]?.split(';')?.[0]}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch office details');
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to load office details');
        }

        setOfficeData(data);
        setError('');
      } catch (error) {
        console.error('Error fetching office data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load office details');
        toast.error(error instanceof Error ? error.message : 'Failed to load office details');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !officeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500">{error || 'No office data available'}</p>
          <button 
            onClick={() => router.push('/coordinator/profile')}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  const { office, coordinator } = officeData;

  return (
    <div className="p-6">
      {/* Office Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold">{office.name} Office</h1>
        <p className="text-gray-600 dark:text-gray-400">{office.location}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Contact Email</p>
            <p>{office.contactEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Phone</p>
            <p>{office.contactPhone}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Coordinators"
          value={office.coordinators.length}
          icon={HiOutlineUserGroup}
        />
        <StatCard
          title="Office Capacity"
          value={office.capacity}
          icon={HiOutlineCube}
        />
        <StatCard
          title="Office Status"
          value={office.status}
          icon={HiOutlineScale}
        />
      </div>

      {/* Coordinator Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p>{coordinator.user.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{coordinator.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p>{coordinator.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p>{coordinator.user.phone}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {coordinator.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-primary-500" />
        </div>
      </div>
    </motion.div>
  );
} 