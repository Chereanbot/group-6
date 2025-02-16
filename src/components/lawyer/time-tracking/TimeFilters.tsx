"use client";

import { useState } from 'react';
import { HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi';
import { DateRange } from 'react-day-picker';

interface Props {
  onFilterChange: (filters: TimeFilters) => void;
}

export interface TimeFilters {
  dateRange?: DateRange;
  status?: string[];
  billable?: boolean;
  search?: string;
  caseId?: string;
}

export function TimeFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<TimeFilters>({});

  const handleFilterChange = (newFilters: Partial<TimeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>
        </div>

        <select
          className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          onChange={(e) => handleFilterChange({ status: [e.target.value] })}
        >
          <option value="">All Status</option>
          <option value="RUNNING">Running</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
        </select>

        <select
          className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          onChange={(e) => handleFilterChange({ billable: e.target.value === 'true' })}
        >
          <option value="">All Entries</option>
          <option value="true">Billable Only</option>
          <option value="false">Non-billable Only</option>
        </select>
      </div>
    </div>
  );
} 