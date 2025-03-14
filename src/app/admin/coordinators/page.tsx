"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Coordinator } from '@/types/coordinator';
import { CoordinatorStatus, CoordinatorType } from '@prisma/client';
import { 
  HiOutlineSearch, HiOutlineFilter, HiOutlineDownload, 
  HiOutlineTrash, HiOutlinePencil, HiOutlineRefresh,
  HiOutlineCheck, HiOutlineX, HiOutlineExclamation,
  HiOutlineSortAscending, HiOutlineSortDescending
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { BlockModal } from '@/components/admin/coordinators/BlockModal';
import { DeleteModal } from '@/components/admin/coordinators/DeleteModal';
import { adminStyles } from '@/styles/admin';

interface CoordinatorData {
  coordinators: Coordinator[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  offices: Array<{
    id: string;
    name: string;
    _count: {
      coordinators: number;
    };
  }>;
}

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

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });

  // Offices state
  const [offices, setOffices] = useState<Array<{
    id: string;
    name: string;
    _count: {
      coordinators: number;
    };
  }>>([]);

  // Modal states
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [coordinatorToDelete, setCoordinatorToDelete] = useState<Coordinator | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadCoordinators = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy: sortField,
        sortOrder: sortOrder
      });

      if (searchTerm) queryParams.append('search', searchTerm);
      filters.status.forEach(status => queryParams.append('status', status));
      filters.type.forEach(type => queryParams.append('type', type));
      if (filters.office) queryParams.append('office', filters.office);

      const response = await fetch(`/api/admin/coordinators?${queryParams}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load coordinators');
      }

      const { coordinators, pagination, stats, offices } = result.data;
      setCoordinators(coordinators);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.total);
      setStats(stats);
      setOffices(offices);
    } catch (error) {
      console.error('Failed to load coordinators:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load coordinators');
      setCoordinators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoordinators();
  }, [currentPage, pageSize, searchTerm, sortField, sortOrder, filters]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleBulkStatusUpdate = async (status: CoordinatorStatus) => {
    try {
      const promises = selectedCoordinators.map(id =>
        fetch(`/api/admin/coordinators?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        })
      );

      await Promise.all(promises);
      toast.success(`Updated status for ${selectedCoordinators.length} coordinators`);
      loadCoordinators();
      setSelectedCoordinators([]);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!coordinatorToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/coordinators?id=${coordinatorToDelete.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Coordinator deleted successfully');
        await loadCoordinators();
      } else {
        toast.error(result.error || 'Failed to delete coordinator');
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

  const handleBlock = async (action: 'block' | 'ban', reason: string) => {
    if (!selectedCoordinator) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/coordinators?id=${selectedCoordinator.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: CoordinatorStatus.SUSPENDED,
          blockReason: reason
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        await loadCoordinators();
      } else {
        toast.error(result.error || `Failed to ${action} coordinator`);
      }
    } catch (error) {
      console.error(`Failed to ${action} coordinator:`, error);
      toast.error(`Failed to ${action} coordinator`);
    } finally {
      setLoading(false);
      setShowBlockModal(false);
      setSelectedCoordinator(null);
    }
  };

  if (loading) {
    return (
      <div className={adminStyles.container}>
        <div className={adminStyles.loading.container}>
          <div className={adminStyles.loading.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={adminStyles.container}>
      {/* Header */}
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Coordinators</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/coordinators/new')}
            className={`${adminStyles.button.base} ${adminStyles.button.primary}`}
          >
            Add Coordinator
          </button>
          <button
            onClick={() => loadCoordinators()}
            className={`${adminStyles.button.base} ${adminStyles.button.secondary}`}
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className={adminStyles.stats.card}>
          <h3 className={adminStyles.stats.title}>Total Coordinators</h3>
          <p className={adminStyles.stats.value}>{stats.total}</p>
        </div>
        <div className={adminStyles.stats.card}>
          <h3 className={adminStyles.stats.title}>Active</h3>
          <p className={adminStyles.stats.value}>{stats.active}</p>
        </div>
        <div className={adminStyles.stats.card}>
          <h3 className={adminStyles.stats.title}>Inactive</h3>
          <p className={adminStyles.stats.value}>{stats.inactive}</p>
        </div>
        <div className={adminStyles.stats.card}>
          <h3 className={adminStyles.stats.title}>Suspended</h3>
          <p className={adminStyles.stats.value}>{stats.suspended}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={adminStyles.filters.container}>
        <div className={adminStyles.filters.group}>
          <input
            type="text"
            placeholder="Search coordinators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={adminStyles.filters.input}
          />
        </div>
        <div className={adminStyles.filters.group}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={adminStyles.filters.input}
          >
            <option value="">All Status</option>
            {Object.values(CoordinatorStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className={adminStyles.filters.group}>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className={adminStyles.filters.input}
          >
            <option value="">All Types</option>
            {Object.values(CoordinatorType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={adminStyles.table.container}>
        <table className={adminStyles.table.table}>
          <thead className={adminStyles.table.header}>
            <tr>
              <th className={adminStyles.table.headerCell}>Name</th>
              <th className={adminStyles.table.headerCell}>Email</th>
              <th className={adminStyles.table.headerCell}>Type</th>
              <th className={adminStyles.table.headerCell}>Office</th>
              <th className={adminStyles.table.headerCell}>Status</th>
              <th className={adminStyles.table.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={adminStyles.table.body}>
            {coordinators.map((coordinator) => (
              <tr key={coordinator.id} className={adminStyles.table.row}>
                <td className={adminStyles.table.cell}>{coordinator.user.fullName}</td>
                <td className={adminStyles.table.cell}>{coordinator.user.email}</td>
                <td className={adminStyles.table.cell}>{coordinator.type}</td>
                <td className={adminStyles.table.cell}>{coordinator.office.name}</td>
                <td className={adminStyles.table.cell}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${coordinator.status === CoordinatorStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    coordinator.status === CoordinatorStatus.INACTIVE ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {coordinator.status}
                  </span>
                </td>
                <td className={adminStyles.table.cell}>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/coordinators/${coordinator.id}/edit`)}
                      className={adminStyles.button.icon}
                    >
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setCoordinatorToDelete(coordinator);
                        setShowDeleteModal(true);
                      }}
                      className={adminStyles.button.icon}
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={adminStyles.pagination.container}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className={`${adminStyles.pagination.button} ${currentPage === 1 ? adminStyles.pagination.disabled : ''}`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className={`${adminStyles.pagination.button} ${currentPage === totalPages ? adminStyles.pagination.disabled : ''}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        coordinator={coordinatorToDelete}
      />
      <BlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
        loading={loading}
        coordinator={selectedCoordinator}
      />
    </div>
  );
};

export default CoordinatorsPage; 