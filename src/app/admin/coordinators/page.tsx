"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CoordinatorListService } from '@/services/coordinator/CoordinatorListService';
import { Coordinator, CoordinatorStatus, CoordinatorType } from '@/types/coordinator';
import { 
  HiOutlineSearch, HiOutlineFilter, HiOutlineDownload, 
  HiOutlineTrash, HiOutlinePencil, HiOutlineRefresh,
  HiOutlineCheck, HiOutlineX, HiOutlineExclamation,
  HiOutlineSortAscending, HiOutlineSortDescending
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { BlockModal } from '@/components/admin/coordinators/BlockModal';
import { DeleteModal } from '@/components/admin/coordinators/DeleteModal';

const CoordinatorsPage = () => {
  const router = useRouter();
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: [] as CoordinatorStatus[],
    type: [] as CoordinatorType[],
    office: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  // New Features - State
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showInactive, setShowInactive] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [coordinatorToDelete, setCoordinatorToDelete] = useState<Coordinator | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);
  const [deleting, setDeleting] = useState(false);

  const service = new CoordinatorListService();

  // Feature 1: Pagination
  const totalPages = Math.ceil(coordinators.length / pageSize);
  const paginatedCoordinators = coordinators.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Feature 2: Sorting
  const sortCoordinators = (data: Coordinator[]) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortField as keyof Coordinator];
      let bValue = b[sortField as keyof Coordinator];
      
      if (sortField === 'fullName') {
        aValue = a.user.fullName;
        bValue = b.user.fullName;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Feature 3: Bulk Actions
  const handleBulkStatusUpdate = async (status: CoordinatorStatus) => {
    try {
      await service.bulkUpdateStatus(selectedCoordinators, status);
      toast.success(`Updated status for ${selectedCoordinators.length} coordinators`);
      loadCoordinators();
      setSelectedCoordinators([]);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Feature 4: Advanced Filtering
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Feature 5: Refresh Data
  const handleRefresh = () => {
    loadCoordinators();
    toast.success('Data refreshed');
  };

  // Feature 6: Delete Coordinator
  const handleDelete = async () => {
    if (!coordinatorToDelete) return;

    try {
      setDeleting(true);
      const response = await service.deleteCoordinator(coordinatorToDelete.id);
      
      if (response.success) {
        toast.success(response.message || 'Coordinator deleted successfully');
        await loadCoordinators();
      } else {
        toast.error(response.error || 'Failed to delete coordinator');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete coordinator';
      toast.error(message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setCoordinatorToDelete(null);
    }
  };

  // Feature 7: Export Selected
  const handleExportSelected = async () => {
    try {
      const blob = await service.exportCoordinators({
        ...filters,
        ids: selectedCoordinators
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coordinators-${new Date().toISOString()}.xlsx`;
      a.click();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  // Feature 8: Quick Status Toggle
  const handleQuickStatusToggle = async (id: string, currentStatus: CoordinatorStatus) => {
    const newStatus = currentStatus === CoordinatorStatus.ACTIVE 
      ? CoordinatorStatus.INACTIVE 
      : CoordinatorStatus.ACTIVE;
    
    try {
      await service.bulkUpdateStatus([id], newStatus);
      toast.success('Status updated');
      loadCoordinators();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Feature 9: Select All
  const handleSelectAll = () => {
    if (selectedCoordinators.length === paginatedCoordinators.length) {
      setSelectedCoordinators([]);
    } else {
      setSelectedCoordinators(paginatedCoordinators.map(c => c.id));
    }
  };

  // Feature 10: Stats Summary
  const stats = {
    total: coordinators.length,
    active: coordinators.filter(c => c.status === CoordinatorStatus.ACTIVE).length,
    inactive: coordinators.filter(c => c.status === CoordinatorStatus.INACTIVE).length,
    suspended: coordinators.filter(c => c.status === CoordinatorStatus.SUSPENDED).length
  };

  useEffect(() => {
    loadCoordinators();
  }, [searchTerm, filters]);

  const loadCoordinators = async () => {
    try {
      setLoading(true);
      const data = await service.getCoordinators({
        search: searchTerm,
        ...filters
      });
      
      if (Array.isArray(data)) {
        setCoordinators(data);
      } else {
        console.error('Invalid data format received:', data);
        toast.error('Failed to load coordinators: Invalid data format');
        setCoordinators([]);
      }
    } catch (error) {
      console.error('Failed to load coordinators:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load coordinators');
      setCoordinators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await service.exportCoordinators(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'coordinators.xlsx';
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  // Add block handler
  const handleBlock = async (action: 'block' | 'ban', reason: string) => {
    if (!selectedCoordinator) return;

    try {
      setLoading(true);
      const response = await service.blockCoordinator(selectedCoordinator.id, action, reason);
      
      if (response.success) {
        toast.success(response.message);
        await loadCoordinators();
      } else {
        toast.error(response.error || `Failed to ${action} coordinator`);
      }
    } catch (error) {
      console.error(`Failed to ${action} coordinator:`, error);
      toast.error(`Failed to ${action} coordinator`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coordinators</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/coordinators/new')}
            className="btn btn-primary"
          >
            Add Coordinator
          </button>
          <button
            onClick={handleExport}
            className="btn btn-outline flex items-center gap-2"
          >
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coordinators..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="border rounded-lg px-4 py-2"
            onChange={(e) => setFilters(prev => ({
              ...prev,
              status: e.target.value ? [e.target.value as CoordinatorStatus] : []
            }))}
          >
            <option value="">All Status</option>
            {Object.values(CoordinatorStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2"
            onChange={(e) => setFilters(prev => ({
              ...prev,
              type: e.target.value ? [e.target.value as CoordinatorType] : []
            }))}
          >
            <option value="">All Types</option>
            {Object.values(CoordinatorType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Coordinators</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Inactive</div>
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Suspended</div>
          <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCoordinators.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-center justify-between">
          <div className="text-sm">
            {selectedCoordinators.length} coordinators selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusUpdate(CoordinatorStatus.ACTIVE)}
              className="btn btn-success btn-sm"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(CoordinatorStatus.INACTIVE)}
              className="btn btn-warning btn-sm"
            >
              Deactivate
            </button>
            <button
              onClick={handleExportSelected}
              className="btn btn-primary btn-sm"
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Coordinators Table */}
      {coordinators.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No coordinators found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Office
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coordinators.map((coordinator) => (
                <tr key={coordinator.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {coordinator.user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coordinator.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{coordinator.office.name}</div>
                    <div className="text-sm text-gray-500">{coordinator.office.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {coordinator.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${coordinator.status === CoordinatorStatus.ACTIVE ? 'bg-green-100 text-green-800' : 
                        coordinator.status === CoordinatorStatus.INACTIVE ? 'bg-gray-100 text-gray-800' :
                        coordinator.status === CoordinatorStatus.SUSPENDED ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {coordinator.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => router.push(`/admin/coordinators/${coordinator.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedCoordinator(coordinator);
                          setShowBlockModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Block/Ban
                      </button>
                      <button 
                        onClick={() => {
                          setCoordinatorToDelete(coordinator);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            className="border rounded-lg px-2 py-1"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, coordinators.length)} of {coordinators.length}
          </span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && coordinatorToDelete && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCoordinatorToDelete(null);
          }}
          onConfirm={handleDelete}
          coordinatorName={coordinatorToDelete.user.fullName}
          loading={deleting}
        />
      )}

      {/* Block Modal */}
      {showBlockModal && selectedCoordinator && (
        <BlockModal
          isOpen={showBlockModal}
          onClose={() => {
            setShowBlockModal(false);
            setSelectedCoordinator(null);
          }}
          onConfirm={handleBlock}
          coordinatorName={selectedCoordinator.user.fullName}
        />
      )}
    </div>
  );
};

export default CoordinatorsPage; 