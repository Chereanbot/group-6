"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiOutlineDownload,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi';

interface SecurityLog {
  id: string;
  timestamp: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  userId?: string;
  userName?: string;
  status: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  eventType: string;
  severity: string;
  status: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export default function SecurityLogs() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    eventType: '',
    severity: '',
    status: ''
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0
  });
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Sample event types for filtering
  const eventTypes = [
    'Login Attempt',
    'Password Change',
    '2FA Configuration',
    'Permission Change',
    'Security Setting Update',
    'User Lockout',
    'IP Block'
  ];

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      // API call to fetch logs with filters
      // Simulated data for demonstration
      const sampleLogs: SecurityLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          eventType: 'Login Attempt',
          severity: 'medium',
          description: 'Failed login attempt from unknown IP',
          ipAddress: '192.168.1.1',
          userId: 'user123',
          userName: 'John Doe',
          status: 'failure',
          details: {
            browser: 'Chrome',
            os: 'Windows',
            location: 'New York, US'
          }
        },
        // Add more sample logs...
      ];
      setLogs(sampleLogs);
    } catch (error) {
      toast.error('Failed to load security logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Logic to export logs as CSV/Excel
      toast.success('Logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[severity] || colors.low;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />;
      case 'failure':
        return <HiOutlineXCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const handleViewDetails = (log: SecurityLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg border dark:border-gray-700"
          >
            <HiOutlineFilter className="w-5 h-5" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 flex items-center gap-2 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg border dark:border-gray-700"
          >
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Type
              </label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Events</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Logs table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{log.eventType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {log.userName || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(log.status)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      <HiOutlineEye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
          >
            Previous
          </button>
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page * pagination.limit >= pagination.total}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
              >
                <HiOutlineChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
              >
                <HiOutlineChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Log Details</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Type</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLog.eventType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Severity</p>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(selectedLog.severity)}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <div className="mt-1 flex items-center">
                      {getStatusIcon(selectedLog.status)}
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">User Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Name</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedLog.userName || 'System'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedLog.ipAddress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Details</h4>
                <div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLog(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 