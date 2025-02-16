"use client";

import { AppealStats as AppealStatsType } from '@/types/appeal.types';
import {
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineCalendar,
  HiOutlineX
} from 'react-icons/hi';

interface AppealStatsProps {
  stats: AppealStatsType;
}

export function AppealStats({ stats }: AppealStatsProps) {
  const statCards = [
    {
      title: 'Total Appeals',
      value: stats.total,
      icon: HiOutlineScale,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: HiOutlineClock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Scheduled',
      value: stats.scheduled,
      icon: HiOutlineCalendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Decided',
      value: stats.decided,
      icon: HiOutlineCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Withdrawn',
      value: stats.withdrawn,
      icon: HiOutlineX,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: HiOutlineExclamation,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100'
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