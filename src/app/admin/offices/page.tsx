"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineEye, HiOutlinePlus, 
  HiOfficeBuilding, HiUsers, HiLocationMarker, HiSearch } from 'react-icons/hi';
import { OfficeType, OfficeStatus } from '@prisma/client';
import EditOfficeModal from '@/components/admin/offices/EditOfficeModal';
import OfficeDetailsModal from '@/components/admin/offices/OfficeDetailsModal';
import CreateOfficeModal from '@/components/admin/offices/CreateOfficeModal';
import { useRouter } from 'next/navigation';

interface Office {
  id: string;
  name: string;
  location: string;
  type: OfficeType;
  status: OfficeStatus;
  contactEmail: string;
  contactPhone: string;
  address: string;
  capacity: number;
  _count?: {
    lawyers: number;
    coordinators: number;
  };
}

export default function OfficesPage() {
  const router = useRouter();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOfficeType, setSelectedOfficeType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalOffices: 0,
    activeOffices: 0,
    totalStaff: 0,
    totalCapacity: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
  }, [router]);

  const fetchOffices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (selectedOfficeType) queryParams.append('type', selectedOfficeType);
      if (selectedStatus) queryParams.append('status', selectedStatus);

      const response = await fetch(`/api/offices?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOffices(data.data.offices);
        // Calculate stats
        const activeOffices = data.data.offices.filter((o: Office) => o.status === 'ACTIVE');
        const totalStaff = data.data.offices.reduce((acc: number, o: Office) => 
          acc + (o._count?.lawyers || 0) + (o._count?.coordinators || 0), 0);
        const totalCapacity = data.data.offices.reduce((acc: number, o: Office) => 
          acc + (o.capacity || 0), 0);
        
        setStats({
          totalOffices: data.data.offices.length,
          activeOffices: activeOffices.length,
          totalStaff,
          totalCapacity
        });
      } else {
        toast.error(data.error || 'Failed to fetch offices');
      }
    } catch (error) {
      console.error('Error fetching offices:', error);
      toast.error('Failed to fetch offices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, [searchQuery, selectedOfficeType, selectedStatus]);

  const handleDeleteOffice = async (officeId: string) => {
    if (!confirm('Are you sure you want to delete this office?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`/api/offices/${officeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Office deleted successfully');
        fetchOffices();
      } else {
        toast.error(data.error || 'Failed to delete office');
      }
    } catch (error) {
      console.error('Error deleting office:', error);
      toast.error('Failed to delete office');
    }
  };

  const getStatusColor = (status: OfficeStatus) => {
    switch (status) {
      case OfficeStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case OfficeStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case OfficeStatus.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatStatus = (status: OfficeStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatType = (type: OfficeType) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900">
              <HiOfficeBuilding className="h-6 w-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Offices</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalOffices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <HiOfficeBuilding className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Offices</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeOffices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <HiUsers className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalStaff}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <HiLocationMarker className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Capacity</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalCapacity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Office Management
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors"
        >
          <HiOutlinePlus className="h-5 w-5 mr-2" />
          Add Office
        </button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search offices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
          <select
            value={selectedOfficeType}
            onChange={(e) => setSelectedOfficeType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="HEADQUARTERS">Headquarters</option>
            <option value="BRANCH">Branch</option>
            <option value="SATELLITE">Satellite</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th scope="col" className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <HiOfficeBuilding className="h-5 w-5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Office Name
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <HiLocationMarker className="h-5 w-5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <HiUsers className="h-5 w-5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Staff Count
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </td>
                </tr>
                ))
              ) : offices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <HiOfficeBuilding className="h-12 w-12 text-gray-400" />
                      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No offices found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                offices.map((office) => (
                  <tr 
                    key={office.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-full w-full rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <HiOfficeBuilding className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {office.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {office.id.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <HiLocationMarker className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900 dark:text-white">{office.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {formatType(office.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(office.status)}`}>
                        <span className="h-2 w-2 rounded-full bg-current mr-2"></span>
                      {formatStatus(office.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                      {office._count ? (
                        <>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              <HiUsers className="h-4 w-4 mr-1" />
                              {office._count.lawyers} Lawyers
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              <HiUsers className="h-4 w-4 mr-1" />
                              {office._count.coordinators} Coordinators
                            </span>
                        </>
                      ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                      {office.contactEmail}
                        </div>
                        <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {office.contactPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedOffice(office);
                          setIsDetailsModalOpen(true);
                        }}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
                          title="View Details"
                      >
                        <HiOutlineEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOffice(office);
                          setIsEditModalOpen(true);
                        }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                          title="Edit Office"
                      >
                        <HiOutlinePencilAlt className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffice(office.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                          title="Delete Office"
                      >
                        <HiOutlineTrash className="h-5 w-5" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
      <CreateOfficeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchOffices();
        }}
      />
      )}

      {selectedOffice && isEditModalOpen && (
      <EditOfficeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOffice(null);
        }}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedOffice(null);
          fetchOffices();
        }}
          office={selectedOffice}
      />
      )}

      {selectedOffice && isDetailsModalOpen && (
      <OfficeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOffice(null);
        }}
          office={selectedOffice}
      />
      )}
    </div>
  );
} 