"use client";

import { useState } from 'react';
import { HiOutlineFilter, HiOutlineViewGrid, HiOutlineViewList } from 'react-icons/hi';

interface FilterProps {
  onViewChange?: (view: 'grid' | 'list') => void;
  onFilterChange?: (filters: DocumentFilters) => void;
}

interface DocumentFilters {
  type?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  tags?: string[];
}

export default function DocumentFilters({ onViewChange, onFilterChange }: FilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const handleViewToggle = (newView: 'grid' | 'list') => {
    setView(newView);
    onViewChange?.(newView);
  };

  const handleFilterChange = (newFilters: Partial<DocumentFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* View Toggle */}
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
        <button
          onClick={() => handleViewToggle('grid')}
          className={`p-2 ${
            view === 'grid'
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <HiOutlineViewGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleViewToggle('list')}
          className={`p-2 ${
            view === 'list'
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <HiOutlineViewList className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg border border-gray-300 dark:border-gray-600 ${
            showFilters
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <HiOutlineFilter className="w-5 h-5" />
        </button>

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filters</h3>
              
              {/* Document Type */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                  onChange={(e) => handleFilterChange({ type: [e.target.value] })}
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Word</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="mb-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                    onChange={(e) =>
                      handleFilterChange({
                        dateRange: {
                          ...filters.dateRange,
                          start: e.target.value ? new Date(e.target.value) : null,
                        },
                      })
                    }
                  />
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                    onChange={(e) =>
                      handleFilterChange({
                        dateRange: {
                          ...filters.dateRange,
                          end: e.target.value ? new Date(e.target.value) : null,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-primary-500 text-white rounded-md py-2 text-sm hover:bg-primary-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 