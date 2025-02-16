"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineChat,
  HiOutlineScale,
  HiOutlineCalendar,
  HiOutlinePhotograph
} from 'react-icons/hi';

const mockTimeline = [
  {
    id: '1',
    date: '2024-03-05',
    type: 'document',
    title: 'Case Filed',
    description: 'Initial case documents submitted',
    icon: <HiOutlineDocumentText className="w-6 h-6" />
  },
  {
    id: '2',
    date: '2024-03-07',
    type: 'communication',
    title: 'Lawyer Assigned',
    description: 'John Doe has been assigned to your case',
    icon: <HiOutlineChat className="w-6 h-6" />
  },
  {
    id: '3',
    date: '2024-03-10',
    type: 'hearing',
    title: 'Initial Hearing',
    description: 'First court appearance scheduled',
    icon: <HiOutlineScale className="w-6 h-6" />
  },
  {
    id: '4',
    date: '2024-03-15',
    type: 'upcoming',
    title: 'Document Submission Deadline',
    description: 'Submit supporting documents',
    icon: <HiOutlineCalendar className="w-6 h-6" />
  }
];

const CaseTimeline = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Case Timeline</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track the progress and important events of your case
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex space-x-4">
        {['all', 'document', 'communication', 'hearing', 'upcoming'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg capitalize
              ${filter === type 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Timeline Items */}
        <div className="space-y-8">
          {mockTimeline
            .filter(item => filter === 'all' || item.type === filter)
            .map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start ml-8"
              >
                {/* Icon */}
                <div className="absolute -left-10 p-2 rounded-full bg-white dark:bg-gray-800 border-2 border-primary-500">
                  {item.icon}
                </div>

                {/* Content */}
                <div className="ml-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.date}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CaseTimeline; 