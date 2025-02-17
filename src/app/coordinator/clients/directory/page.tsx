"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineUserAdd,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExclamationCircle,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  cases: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
  appointments: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
  }>;
}

export default function ClientDirectory() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchClients = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/coordinator/clients?${params}`);
      const result = await response.json();

      if (result.success) {
        setClients(result.data.clients);
        setTotalPages(result.data.pagination.pages);
      } else {
        toast.error(result.error || 'Failed to fetch clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('An error occurred while fetching clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const deleteResponse = await fetch(`/api/coordinator/clients/${id}`, {
        method: 'DELETE'
      });
      const result = await deleteResponse.json();

      if (result.success) {
        toast.success('Client deleted successfully');
        fetchClients();
      } else {
        toast.error(result.error || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('An error occurred while deleting client');
    } finally {
      setShowDeleteModal(false);
      setSelectedClient(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Client Directory
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage and view all registered clients
              </p>
            </div>
            <button
              onClick={() => router.push('/coordinator/clients/register')}
              className="inline-flex items-center px-4 py-2 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 
                hover:bg-primary-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-primary-500"
            >
              <HiOutlineUserAdd className="h-5 w-5 mr-2" />
              New Client
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                  pl-10 focus:border-primary-500 focus:ring-primary-500 
                  dark:bg-gray-700 dark:text-white sm:text-sm"
              />
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                  pl-10 focus:border-primary-500 focus:ring-primary-500 
                  dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No clients found
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                {client.fullName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {client.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {client.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.phone}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.cases.length} Cases
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.appointments.length} Upcoming Appointments
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(client.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/coordinator/clients/${client.id}`)}
                            className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                          >
                            <HiOutlineEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/coordinator/clients/${client.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                          >
                            <HiOutlinePencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 
                    text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50
                    dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700 
                    dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 
                    text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50
                    dark:border-gray-600 dark:text-gray-200 dark:bg-gray-700 
                    dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md 
                        border border-gray-300 bg-white text-sm font-medium text-gray-500 
                        hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 
                        dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">First</span>
                      <HiOutlineChevronDoubleLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 
                        bg-white text-sm font-medium text-gray-500 hover:bg-gray-50
                        dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 
                        dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <HiOutlineChevronLeft className="h-5 w-5" />
                    </button>
                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border 
                          ${currentPage === index + 1
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-500 dark:text-primary-200'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                          } text-sm font-medium`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 
                        bg-white text-sm font-medium text-gray-500 hover:bg-gray-50
                        dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 
                        dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <HiOutlineChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md 
                        border border-gray-300 bg-white text-sm font-medium text-gray-500 
                        hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 
                        dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <span className="sr-only">Last</span>
                      <HiOutlineChevronDoubleRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                  <HiOutlineExclamationCircle className="h-6 w-6 text-red-600 dark:text-red-200" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Delete Client
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete {selectedClient.fullName}? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedClient.id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent 
                    shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white 
                    hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedClient(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border 
                    border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium 
                    text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 
                    dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 