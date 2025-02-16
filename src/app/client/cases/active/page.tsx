"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineCalendar,
  HiOutlineChat,
  HiOutlineDocumentDuplicate,
  HiChevronRight
} from 'react-icons/hi';

const mockCases = [
  {
    id: 'CASE-2024-001',
    title: 'Property Dispute Resolution',
    type: 'Civil Litigation',
    status: 'active',
    priority: 'high',
    lastUpdate: '2024-03-05',
    nextHearing: '2024-03-15',
    lawyer: 'John Doe',
    progress: 65
  },
  // Add more mock cases
];

const ActiveCases = () => {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Active Cases</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage your ongoing legal cases
        </p>
      </div>

      {/* Cases Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCases.map((case_) => (
          <motion.div
            key={case_.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Case Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{case_.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs
                  ${case_.priority === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                  {case_.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {case_.type}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="px-4 py-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{case_.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full"
                  style={{ width: `${case_.progress}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center space-x-2 p-2
                bg-gray-100 dark:bg-gray-700 rounded-lg
                hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <HiOutlineDocumentText className="w-5 h-5" />
                <span>Details</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-2
                bg-gray-100 dark:bg-gray-700 rounded-lg
                hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <HiOutlineChat className="w-5 h-5" />
                <span>Message</span>
              </button>
            </div>

            {/* Case Info */}
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <HiOutlineClock className="w-4 h-4 mr-2" />
                Last update: {case_.lastUpdate}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <HiOutlineCalendar className="w-4 h-4 mr-2" />
                Next hearing: {case_.nextHearing}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActiveCases; 