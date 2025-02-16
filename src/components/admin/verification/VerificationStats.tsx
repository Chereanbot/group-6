"use client";

import { useState, useEffect } from 'react';
import { 
  HiOutlineDocumentSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock
} from 'react-icons/hi';

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function VerificationStats() {
  const [statsData, setStatsData] = useState<VerificationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/verification/stats');
      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Failed to load verification stats:', error);
    }
  };

  const statCards = [
    {
      name: 'Pending',
      value: statsData.pending,
      icon: HiOutlineClock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900'
    },
    {
      name: 'Approved',
      value: statsData.approved,
      icon: HiOutlineCheck,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900'
    },
    {
      name: 'Rejected',
      value: statsData.rejected,
      icon: HiOutlineX,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900'
    },
    {
      name: 'Total',
      value: statsData.total,
      icon: HiOutlineDocumentSearch,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900'
    }
  ];

  return (
    <>
      {statCards.map((stat) => (
        <div
          key={stat.name}
          className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bg} rounded-md p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
} 