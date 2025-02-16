"use client";

import { motion } from 'framer-motion';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  type?: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

export function MetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  type = 'default' 
}: MetricsCardProps) {
  const colors = {
    default: 'bg-blue-100 text-black dark:bg-blue-900/40 dark:text-blue-200',
    info: 'bg-indigo-100 text-black dark:bg-indigo-900/40 dark:text-indigo-200',
    success: 'bg-green-100 text-black dark:bg-green-900/40 dark:text-green-200',
    warning: 'bg-yellow-100 text-black dark:bg-yellow-900/40 dark:text-yellow-200',
    danger: 'bg-red-100 text-black dark:bg-red-900/40 dark:text-red-200'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-black dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${colors[type]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4">
          <span className={trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
        </div>
      )}
    </motion.div>
  );
} 