"use client";

import { useState, useEffect } from 'react';
import { 
  HiOutlineDocumentSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock
} from 'react-icons/hi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import DocumentPreview from './DocumentPreview';

interface VerificationRequest {
  id: string;
  userId: string;
  user: {
    fullName: string;
    email: string;
  };
  documentType: string;
  documentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    fullName: string;
  };
  documentUrl: string;
}

interface VerificationListProps {
  status: string;
}

export default function VerificationList({ status }: VerificationListProps) {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    loadVerificationRequests();
  }, [status]);

  const loadVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/verification?status=${status}`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to load verification requests:', error);
      toast.error('Failed to load verification requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/verification/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Verification action failed');

      toast.success(`Request ${action}ed successfully`);
      await loadVerificationRequests();
    } catch (error) {
      console.error('Verification action failed:', error);
      toast.error('Failed to process verification request');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="text-center py-12">
        <HiOutlineDocumentSearch className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No requests found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          There are no verification requests matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.user.fullName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {request.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {request.documentType}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {request.documentNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(request.submittedAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerification(request.id, 'approve')}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <HiOutlineCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleVerification(request.id, 'reject')}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedDocument(request)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <HiOutlineDocumentSearch className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedDocument && (
          <DocumentPreview
            documentUrl={selectedDocument.documentUrl}
            documentType={selectedDocument.documentType}
            documentNumber={selectedDocument.documentNumber}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </>
  );
} 