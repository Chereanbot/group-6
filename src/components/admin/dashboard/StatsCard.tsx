"use client";

import { motion } from 'framer-motion';
import { HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  type: 'users' | 'cases' | 'revenue' | 'performance';
}

const StatsCard = ({ title, value, icon, change, type }: StatsCardProps) => {
  const getTypeStyles = () => {
    const styles = {
      users: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
      cases: 'bg-green-50 text-green-600 dark:bg-green-900/20',
      revenue: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
      performance: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
    };
    return styles[type];
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${getTypeStyles()}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
        {title}
      </h3>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        {typeof change !== 'undefined' && (
          <div className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? (
              <HiArrowSmUp className="w-4 h-4 mr-1" />
            ) : (
              <HiArrowSmDown className="w-4 h-4 mr-1" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard; 