"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineSort,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineHome,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineDocumentText
} from 'react-icons/hi';

interface Resident {
  id: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email: string;
  address: string;
  registrationDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  documents: {
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
  }[];
}

const mockResidents: Resident[] = [
  {
    id: '1',
    fullName: 'John Doe',
    idNumber: 'KBL-2024-001',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    phone: '+251911234567',
    email: 'john.doe@example.com',
    address: '123 Main Street, Kebele 01',
    registrationDate: '2024-01-15',
    status: 'ACTIVE',
    documents: [
      {
        type: 'ID Card',
        number: 'ID-2024-001',
        issueDate: '2024-01-15',
        expiryDate: '2029-01-15'
      }
    ]
  },
  {
    id: '2',
    fullName: 'Sarah Johnson',
    idNumber: 'KBL-2024-002',
    dateOfBirth: '1988-08-22',
    gender: 'FEMALE',
    phone: '+251922345678',
    email: 'sarah.j@example.com',
    address: '456 Park Avenue, Kebele 01',
    registrationDate: '2024-01-20',
    status: 'ACTIVE',
    documents: [
      {
        type: 'ID Card',
        number: 'ID-2024-002',
        issueDate: '2024-01-20',
        expiryDate: '2029-01-20'
      }
    ]
  },
  {
    id: '3',
    fullName: 'Michael Smith',
    idNumber: 'KBL-2024-003',
    dateOfBirth: '1995-03-10',
    gender: 'MALE',
    phone: '+251933456789',
    email: 'michael.s@example.com',
    address: '789 Oak Road, Kebele 01',
    registrationDate: '2024-02-01',
    status: 'PENDING',
    documents: []
  }
];

export default function ResidentDirectory() {
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showAddModal, setShowAddModal] = useState(false);

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
      case 'ACTIVE':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'INACTIVE':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resident Directory
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and view all registered residents in your kebele
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
            transition-colors duration-200 flex items-center gap-2"
        >
          <HiOutlinePlus className="h-5 w-5" />
          <span>Add Resident</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search residents..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
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
            <option value="name">Name</option>
            <option value="id">ID Number</option>
            <option value="date">Registration Date</option>
          </select>
        </div>
      </div>

      {/* Residents List */}
      <div className="grid gap-4">
        {residents.map((resident) => (
          <motion.div
            key={resident.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                  <HiOutlineUser className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {resident.fullName}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlineIdentification className="h-4 w-4 mr-1" />
                      {resident.idNumber}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <HiOutlinePhone className="h-4 w-4 mr-1" />
                      {resident.phone}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(resident.status)}`}>
                  {resident.status}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedResident(resident)}
                    className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 
                      dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HiOutlineDocumentText className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 
                    dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <HiOutlinePencil className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 
                    dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    <HiOutlineTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Resident Details Modal */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Resident Details
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  View complete information about the resident
                </p>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Information</h3>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <HiOutlineUser className="h-5 w-5 mr-2 text-gray-400" />
                    {selectedResident.fullName}
                  </div>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <HiOutlineIdentification className="h-5 w-5 mr-2 text-gray-400" />
                    {selectedResident.idNumber}
                  </div>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <HiOutlineCalendar className="h-5 w-5 mr-2 text-gray-400" />
                    {new Date(selectedResident.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h3>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <HiOutlinePhone className="h-5 w-5 mr-2 text-gray-400" />
                    {selectedResident.phone}
                  </div>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <HiOutlineMail className="h-5 w-5 mr-2 text-gray-400" />
                    {selectedResident.email}
                  </div>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <HiOutlineLocationMarker className="h-5 w-5 mr-2 text-gray-400" />
                    {selectedResident.address}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Documents</h3>
              <div className="space-y-3">
                {selectedResident.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{doc.type}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Number: {doc.number}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      <p>Issued: {new Date(doc.issueDate).toLocaleDateString()}</p>
                      <p>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {selectedResident.documents.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
                    No documents available
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedResident(null)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 
                  rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 