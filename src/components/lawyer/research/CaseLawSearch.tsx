"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiOutlineCalendar,
  HiOutlineScale,
  HiOutlineTag,
  HiOutlineAdjustments
} from 'react-icons/hi';

interface CaseLawSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    courts: string[];
    dateRange: any;
    tags: string[];
    specialization: string;
    jurisdiction: string;
    yearRange: {
      start: number;
      end: number;
    };
    sortBy: 'relevance' | 'date' | 'citations';
    sortOrder: 'asc' | 'desc';
  };
  onFilterChange: (filters: any) => void;
  onSearch: () => void;
  loading: boolean;
  userSpecializations: string[];
}

export const CaseLawSearch: React.FC<CaseLawSearchProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onSearch,
  loading,
  userSpecializations
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search case law..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all duration-200"
        />
        <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                  w-5 h-5 text-gray-400" />
        <button
          onClick={onSearch}
          disabled={loading}
          className="absolute right-4 top-1/2 transform -translate-y-1/2
                   px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <HiOutlineFilter className="w-5 h-5" />
          <h3 className="font-medium">Filters</h3>
        </div>

        {/* Courts Filter */}
        <div className="flex items-center gap-2">
          <HiOutlineScale className="w-5 h-5 text-gray-400" />
          <select
            value={filters.courts.join(',')}
            onChange={(e) => onFilterChange({
              ...filters,
              courts: e.target.value ? e.target.value.split(',') : []
            })}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Courts</option>
            <option value="Supreme Court">Supreme Court</option>
            <option value="High Court">High Court</option>
            <option value="District Court">District Court</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={filters.dateRange || ''}
            onChange={(e) => onFilterChange({
              ...filters,
              dateRange: e.target.value
            })}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Specialization Filter */}
        <div className="flex items-center gap-2">
          <HiOutlineTag className="w-5 h-5 text-gray-400" />
          <select
            value={filters.specialization}
            onChange={(e) => onFilterChange({
              ...filters,
              specialization: e.target.value
            })}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Specializations</option>
            {userSpecializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <HiOutlineAdjustments className="w-5 h-5 text-gray-400" />
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              onFilterChange({
                ...filters,
                sortBy,
                sortOrder
              });
            }}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="relevance-desc">Most Relevant</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="citations-desc">Most Cited</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 