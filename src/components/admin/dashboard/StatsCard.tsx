"use client";

import { motion } from 'framer-motion';
import { HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';
import { StatsCardProps } from '@/types/admin.types';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  type,
  subStats 
}: StatsCardProps) => {
  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTypeColor = () => {
    switch (type) {
      case 'users':
        return 'bg-blue-500';
      case 'cases':
        return 'bg-green-500';
      case 'revenue':
        return 'bg-purple-500';
      case 'performance':
        return 'bg-yellow-500';
      case 'resources':
        return 'bg-pink-500';
      case 'documents':
        return 'bg-indigo-500';
      case 'workload':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${getTypeColor()} text-white`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
            {typeof change !== 'undefined' && (
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor()}`}>
                {change > 0 ? (
                  <HiArrowUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                ) : (
                  <HiArrowDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                )}
                <span className="ml-1">{Math.abs(change)}%</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {subStats && subStats.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4">
            {subStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard; 