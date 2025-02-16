"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiOutlineUserAdd,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineOfficeBuilding,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi';

interface KebeleManager {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  position: string;
  officeLocation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  kebele: {
    kebeleName: string;
    kebeleNumber: string;
  };
}

export default function KebeleManagersList() {
  const router = useRouter();
  const [managers, setManagers] = useState<KebeleManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/coordinator/kebele-managers');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch managers');
      }

      setManagers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/coordinator/kebele-managers?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete manager');
      }

      setManagers(prev => prev.filter(manager => manager.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting manager:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete manager');
    }
  };

  const filteredManagers = managers.filter(manager =>
    manager.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.kebele.kebeleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.phone.includes(searchTerm) ||
    (manager.email && manager.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kebele Managers
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage and monitor kebele managers
            </p>
          </div>

          <button
            onClick={() => router.push('/coordinator/kebele/managers/add')}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg
              hover:bg-primary-600 transition-colors duration-200"
          >
            <HiOutlineUserAdd className="w-5 h-5 mr-2" />
            Add Manager
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search managers by name, kebele, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Managers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((manager) => (
            <motion.div
              key={manager.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {manager.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {manager.position}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full
                    ${manager.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                    ${manager.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : ''}
                    ${manager.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : ''}`}
                  >
                    {manager.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiOutlineOfficeBuilding className="w-4 h-4 mr-2" />
                    <span>{manager.kebele.kebeleName} ({manager.kebele.kebeleNumber})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <HiOutlinePhone className="w-4 h-4 mr-2" />
                    <span>{manager.phone}</span>
                  </div>
                  {manager.email && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <HiOutlineMail className="w-4 h-4 mr-2" />
                      <span>{manager.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                  <button
                    onClick={() => router.push(`/coordinator/kebele/managers/edit/${manager.id}`)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400
                      dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(manager.id)}
                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400
                      dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === manager.id && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    Are you sure you want to delete this manager?
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400
                        hover:text-gray-900 dark:hover:text-white rounded-md
                        hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(manager.id)}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400
                        hover:text-red-900 dark:hover:text-red-300 rounded-md
                        hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      <HiOutlineCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {filteredManagers.length === 0 && !loading && (
          <div className="text-center py-12">
            <HiOutlineUserAdd className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No managers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new manager'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 