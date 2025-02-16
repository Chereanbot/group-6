"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineSort,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineUser
} from 'react-icons/hi';

interface Case {
  id: string;
  title: string;
  applicant: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  submittedDate: string;
  lastUpdated: string;
  description: string;
}

const mockCases: Case[] = [
  {
    id: '1',
    title: 'Birth Certificate Request',
    applicant: 'John Doe',
    type: 'Document Request',
    status: 'PENDING',
    priority: 'HIGH',
    submittedDate: '2024-02-15',
    lastUpdated: '2024-02-16',
    description: 'Request for newborn birth certificate'
  },
  {
    id: '2',
    title: 'Marriage Certificate',
    applicant: 'Sarah Johnson',
    type: 'Document Request',
    status: 'APPROVED',
    priority: 'MEDIUM',
    submittedDate: '2024-02-14',
    lastUpdated: '2024-02-15',
    description: 'Marriage certificate request for recent ceremony'
  },
  {
    id: '3',
    title: 'Residence Change',
    applicant: 'Michael Smith',
    type: 'Address Change',
    status: 'REJECTED',
    priority: 'LOW',
    submittedDate: '2024-02-13',
    lastUpdated: '2024-02-14',
    description: 'Request to update residential address'
  },
  // Add more mock cases as needed
];

export default function CaseManagement() {
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search logic here
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
    // Implement filter logic here
  };

  const handleSort = (criteria: string) => {
    setSortBy(criteria);
    // Implement sort logic here
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'LOW':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Case Management
        </h1>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200">
          New Case
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={filterStatus}
            onChange={(e) => handleFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <HiOutlineSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
          >
            <option value="date">Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="grid gap-4">
        {cases.map((case_) => (
          <motion.div
            key={case_.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                  <HiOutlineDocumentText className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {case_.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlineUser className="h-4 w-4 mr-1" />
                      {case_.applicant}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlineCalendar className="h-4 w-4 mr-1" />
                      {new Date(case_.submittedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                  {case_.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                  {case_.priority}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCase(case_)}
                    className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 
                      dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HiOutlineEye className="h-5 w-5" />
                  </button>
                  {case_.status === 'PENDING' && (
                    <>
                      <button className="p-2 text-green-500 hover:text-green-600 dark:text-green-400 
                        dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20">
                        <HiOutlineCheck className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 
                        dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <HiOutlineX className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Case Details
              </h2>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedCase.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Applicant</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedCase.applicant}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedCase.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</h3>
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedCase.priority)}`}>
                    {selectedCase.priority}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Date</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {new Date(selectedCase.submittedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {new Date(selectedCase.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 
                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              {selectedCase.status === 'PENDING' && (
                <>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 