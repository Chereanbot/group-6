"use client";

import { ServiceRequest } from '@/types/service.types';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { HiOutlineDocumentText, HiOutlineUser, HiOutlineCash, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

interface ViewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onStatusUpdate?: (requestId: string, status: string) => Promise<void>;
}

export default function ViewRequestModal({ 
  isOpen, 
  onClose, 
  request,
  onStatusUpdate 
}: ViewRequestModalProps) {
  if (!request) return null;

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
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

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
        {status}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Service Request Details" size="lg">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {request.package?.name || 'Service Request'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created on {formatDate(request.createdAt)}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-gray-700 dark:text-gray-300">{request.description}</p>
        </div>

        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <HiOutlineUser className="w-5 h-5 text-primary-500" />
              <h4 className="font-medium">Client Details</h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Name:</span>{' '}
                {request.client?.fullName}
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>{' '}
                {request.client?.email}
              </p>
            </div>
          </div>

          {/* Package Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <HiOutlineCash className="w-5 h-5 text-primary-500" />
              <h4 className="font-medium">Package Details</h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>{' '}
                {request.serviceType}
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Price:</span>{' '}
                {formatCurrency(request.package?.price || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Documents */}
        {request.documents && request.documents.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
              <h4 className="font-medium">Documents</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  {doc.verified ? (
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Income Proof */}
        {request.incomeProof && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <HiOutlineDocumentText className="w-5 h-5 text-primary-500" />
                <h4 className="font-medium">Income Proof</h4>
              </div>
              {request.incomeProof.verified ? (
                <span className="text-sm text-green-500 flex items-center">
                  <HiOutlineCheckCircle className="w-4 h-4 mr-1" />
                  Verified
                </span>
              ) : (
                <span className="text-sm text-yellow-500 flex items-center">
                  <HiOutlineExclamationCircle className="w-4 h-4 mr-1" />
                  Pending Verification
                </span>
              )}
            </div>
            <p className="text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">Annual Income:</span>{' '}
              {formatCurrency(request.incomeProof.annualIncome)}
            </p>
            {request.incomeProof.verifiedAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verified on {formatDate(request.incomeProof.verifiedAt)}
              </p>
            )}
          </div>
        )}

        {/* Payment Information */}
        {request.payment && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <HiOutlineCash className="w-5 h-5 text-primary-500" />
              <h4 className="font-medium">Payment Details</h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>{' '}
                {formatCurrency(request.payment.amount)}
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Status:</span>{' '}
                <StatusBadge status={request.payment.status} />
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Method:</span>{' '}
                {request.payment.method}
              </p>
              {request.payment.transactionId && (
                <p className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>{' '}
                  {request.payment.transactionId}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
} 