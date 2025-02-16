"use client";

import { ServiceStats } from '@/types/service.types';
import { formatCurrency } from '@/utils/format';
import {
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineCash,
  HiOutlineChartBar
} from 'react-icons/hi';

interface ServiceRequestStatsProps {
  stats: ServiceStats;
}

export function ServiceRequestStats({ stats }: ServiceRequestStatsProps) {
  const statCards = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: HiOutlineDocumentText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Legal Aid',
      value: stats.legalAid,
      icon: HiOutlineScale,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Paid Services',
      value: stats.paid,
      icon: HiOutlineCash,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: HiOutlineClock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: HiOutlineCheck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: HiOutlineChartBar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 