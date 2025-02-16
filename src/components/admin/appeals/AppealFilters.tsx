"use client";

import { useState } from 'react';
import { AppealStatus, AppealFilters as AppealFiltersType } from '@/types/appeal.types';
import { HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';

interface AppealFiltersProps {
  filters: AppealFiltersType;
  onFilterChange: (filters: AppealFiltersType) => void;
}

export function AppealFilters({ filters, onFilterChange }: AppealFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (status: AppealStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFilterChange({
      ...filters,
      status: newStatuses
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search appeals..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          <HiOutlineFilter className="w-5 h-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {Object.values(AppealStatus).map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={() => handleStatusChange(status)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value) : undefined
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <input
                  type="date"
                  value={filters.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    endDate: e.target.value ? new Date(e.target.value) : undefined
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onFilterChange({})}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 