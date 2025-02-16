"use client";

import { useState } from 'react';
import { HiOutlineFilter } from 'react-icons/hi';

interface VerificationFiltersProps {
  onStatusChange: (status: string) => void;
}

export default function VerificationFilters({ onStatusChange }: VerificationFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'approved', label: 'Approved', color: 'text-green-600' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-600' },
    { value: 'all', label: 'All', color: 'text-gray-600' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <HiOutlineFilter className="w-5 h-5 mr-2" />
        Filter Status
      </button>

      {showFilters && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="py-1">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  onStatusChange(status.value);
                  setShowFilters(false);
                }}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className={`${status.color} dark:opacity-75`}>
                  {status.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 