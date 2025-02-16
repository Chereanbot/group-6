"use client";

import { useState, useMemo } from 'react';
import { ServiceRequest, ServiceType, ServiceStatus } from '@/types/service.types';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { AssignLawyerModal } from './modals/AssignLawyerModal';
import { EligibilityCheckModal } from './modals/EligibilityCheckModal';
import ViewRequestModal from './modals/ViewRequestModal';
import { PaymentModal } from './modals/PaymentModal';
import { HiOutlineSearch, HiOutlineFilter, HiOutlineRefresh, HiOutlineDownload, HiOutlineCheck, HiOutlineX, HiOutlineExclamationCircle, HiOutlineClock, HiOutlineDocumentDuplicate, HiOutlineMail } from 'react-icons/hi';
import { Dropdown } from '@/components/ui/Dropdown';
import { convertToCSV, downloadCSV } from '@/utils/export';
import { toast } from 'react-hot-toast';
import { verificationService } from '@/services/verification.service';
import { ReminderModal } from './ReminderModal';

interface ServiceRequestListProps {
  requests: ServiceRequest[];
  loading: boolean;
  onStatusUpdate: (requestId: string, status: string) => Promise<void>;
  onAssignLawyer: (requestId: string, lawyerId: string) => Promise<void>;
  onVerifyEligibility: (requestId: string, isEligible: boolean) => Promise<void>;
  onRefresh: () => void;
  onVerifyDocuments: (requestId: string) => Promise<void>;
  onVerifyPayment: (requestId: string) => Promise<void>;
  onSendReminder: (requestId: string) => Promise<void>;
  onDuplicate: (requestId: string) => Promise<void>;
}

export function ServiceRequestList({
  requests,
  loading,
  onStatusUpdate,
  onAssignLawyer,
  onVerifyEligibility,
  onRefresh,
  onVerifyDocuments,
  onVerifyPayment,
  onSendReminder,
  onDuplicate
}: ServiceRequestListProps) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVerifyingDocuments, setIsVerifyingDocuments] = useState<string[]>([]);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<string[]>([]);
  const [showVerificationHistory, setShowVerificationHistory] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'ALL'>('ALL');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ServiceRequest | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'approve':
        // Implement bulk approve
        break;
      case 'reject':
        // Implement bulk reject
        break;
      case 'export':
        handleExportSelected();
        break;
      default:
        break;
    }
  };

  // Export selected rows
  const handleExportSelected = () => {
    const selectedRequests = requests.filter(req => selectedRows.includes(req.id));
    const csv = convertToCSV(selectedRequests);
    downloadCSV(csv, 'service-requests.csv');
  };

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        request.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.package.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || request.serviceType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [requests, searchTerm, statusFilter, typeFilter, sortConfig]);

  const handleSort = (key: keyof ServiceRequest) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: ServiceType) => {
    switch (type) {
      case 'LEGAL_AID':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300';
      case 'PAID':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Verification handlers
  const handleVerifyDocuments = async (requestId: string, documentIds: string[]) => {
    try {
      if (!documentIds.length) {
        toast.error('No documents available for verification');
        return;
      }

      setIsVerifyingDocuments(prev => [...prev, requestId]);
      await verificationService.verifyDocuments(requestId, documentIds);
      await onRefresh(); // Refresh the list after verification
    } catch (error) {
      console.error('Error verifying documents:', error);
    } finally {
      setIsVerifyingDocuments(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleVerifyPayment = async (requestId: string) => {
    try {
      setIsVerifyingPayment(prev => [...prev, requestId]);
      await verificationService.verifyPayment(requestId);
      await onRefresh(); // Refresh the list after verification
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setIsVerifyingPayment(prev => prev.filter(id => id !== requestId));
    }
  };

  // Bulk verification
  const handleBulkVerification = async () => {
    try {
      await Promise.all(
        selectedRows.map(async (requestId) => {
          await handleVerifyDocuments(requestId, []);
          await handleVerifyPayment(requestId);
        })
      );
      toast.success('Bulk verification completed');
    } catch (error) {
      toast.error('Failed to complete bulk verification');
    }
  };

  // Send reminder
  const handleSendReminder = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setIsReminderModalOpen(true);
    }
  };

  // Duplicate request
  const handleDuplicate = async (requestId: string) => {
    try {
      await onDuplicate(requestId);
      toast.success('Request duplicated successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to duplicate request');
    }
  };

  // Pagination
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);

  // Date range filter
  const handleDateRangeChange = ([start, end]: [Date | null, Date | null]) => {
    setSelectedDateRange([start, end]);
  };

  // Enhanced filtering
  const enhancedFilteredRequests = useMemo(() => {
    return filteredRequests.filter(request => {
      // Date range filter
      if (selectedDateRange[0] && selectedDateRange[1]) {
        const requestDate = new Date(request.createdAt);
        if (
          requestDate < selectedDateRange[0] ||
          requestDate > selectedDateRange[1]
        ) {
          return false;
        }
      }
      return true;
    });
  }, [filteredRequests, selectedDateRange]);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-1 gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | 'ALL')}
            className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ServiceType | 'ALL')}
            className="border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="ALL">All Types</option>
            <option value="PAID">Paid</option>
            <option value="LEGAL_AID">Legal Aid</option>
          </select>
        </div>

        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <Dropdown
              trigger={
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  Bulk Actions ({selectedRows.length})
                </button>
              }
              items={[
                {
                  label: 'Approve Selected',
                  onClick: () => handleBulkAction('approve'),
                  icon: 'check'
                },
                {
                  label: 'Reject Selected',
                  onClick: () => handleBulkAction('reject'),
                  icon: 'x'
                },
                {
                  label: 'Export Selected',
                  onClick: () => handleBulkAction('export'),
                  icon: 'download'
                }
              ]}
            />
          )}
          
          <button
            onClick={onRefresh}
            className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleExportSelected()}
            className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Export"
          >
            <HiOutlineDownload className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="w-4 p-4">
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredRequests.length}
                  onChange={(e) => {
                    setSelectedRows(
                      e.target.checked 
                        ? filteredRequests.map(r => r.id)
                        : []
                    );
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {enhancedFilteredRequests.map((request) => (
              <tr 
                key={request.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedRows.includes(request.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <td className="w-4 p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(request.id)}
                    onChange={(e) => {
                      setSelectedRows(current => 
                        e.target.checked
                          ? [...current, request.id]
                          : current.filter(id => id !== request.id)
                      );
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {request.client.fullName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {request.client.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(request.serviceType)}`}>
                    {request.serviceType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {request.package.name}
                  </span>
                  <span className="block text-sm text-gray-500">
                    {formatCurrency(request.package.price)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {request.assignedLawyer?.fullName || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsViewModalOpen(true);
                    }}
                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View
                  </button>
                  {request.type === 'LEGAL_AID' && request.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsEligibilityModalOpen(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      Check Eligibility
                    </button>
                  )}
                  {!request.assignedLawyer && request.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsAssignModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Assign Lawyer
                    </button>
                  )}
                  {request.type === 'PAID' && request.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsPaymentModalOpen(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Process Payment
                    </button>
                  )}
                  {/* Document Verification */}
                  {!request.documents?.every(d => d.verified) && (
                    <button
                      onClick={() => handleVerifyDocuments(
                        request.id,
                        request.documents?.filter(d => !d.verified).map(d => d.id) || []
                      )}
                      disabled={isVerifyingDocuments.includes(request.id)}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      {isVerifyingDocuments.includes(request.id) ? (
                        <HiOutlineClock className="w-5 h-5 animate-spin" />
                      ) : (
                        <HiOutlineCheck className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  {/* Payment Verification */}
                  {request.payment && !request.payment.verified && (
                    <button
                      onClick={() => handleVerifyPayment(request.id)}
                      disabled={isVerifyingPayment.includes(request.id)}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      {isVerifyingPayment.includes(request.id) ? (
                        <HiOutlineClock className="w-5 h-5 animate-spin" />
                      ) : (
                        'Verify Payment'
                      )}
                    </button>
                  )}

                  {/* Reminder Button */}
                  <button
                    onClick={() => handleSendReminder(request.id)}
                    className="text-yellow-600 hover:text-yellow-900 flex items-center space-x-1"
                    title="Send Reminder"
                  >
                    <HiOutlineMail className="w-5 h-5" />
                    <span className="text-sm">Remind</span>
                  </button>

                  {/* Duplicate Button */}
                  <button
                    onClick={() => handleDuplicate(request.id)}
                    className="text-gray-600 hover:text-gray-900"
                    title="Duplicate Request"
                  >
                    <HiOutlineDocumentDuplicate className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add pagination controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded-lg px-2 py-1"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
          <span className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedRequest && (
        <>
          <AssignLawyerModal
            isOpen={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onAssign={onAssignLawyer}
          />
          <EligibilityCheckModal
            isOpen={isEligibilityModalOpen}
            onClose={() => {
              setIsEligibilityModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onVerify={onVerifyEligibility}
          />
          <ViewRequestModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onStatusUpdate={onStatusUpdate}
          />
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onSuccess={onRefresh}
          />
          <ReminderModal
            isOpen={isReminderModalOpen}
            onClose={() => {
              setIsReminderModalOpen(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onSuccess={onRefresh}
          />
        </>
      )}
    </div>
  );
} 