"use client";

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { ServiceRequest, ServiceDocument } from '@/types/service.types';
import { formatDate } from '@/utils/date';
import { HiOutlineCheck, HiOutlineX, HiOutlineDocumentText } from 'react-icons/hi';

interface VerifyDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onVerify: (documentIds: string[]) => Promise<void>;
}

export function VerifyDocumentsModal({
  isOpen,
  onClose,
  request,
  onVerify
}: VerifyDocumentsModalProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      await onVerify(selectedDocs);
      onClose();
    } catch (error) {
      console.error('Error verifying documents:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Documents">
      <div className="space-y-4">
        <div className="max-h-96 overflow-y-auto">
          {request.documents?.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded-lg border mb-2
                ${doc.verified 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20' 
                  : 'bg-white dark:bg-gray-800'}`}
            >
              <div className="flex items-center space-x-3">
                <HiOutlineDocumentText className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded on {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              
              {doc.verified ? (
                <span className="text-green-600 flex items-center">
                  <HiOutlineCheck className="w-5 h-5 mr-1" />
                  Verified
                </span>
              ) : (
                <input
                  type="checkbox"
                  checked={selectedDocs.includes(doc.id)}
                  onChange={(e) => {
                    setSelectedDocs(current => 
                      e.target.checked
                        ? [...current, doc.id]
                        : current.filter(id => id !== doc.id)
                    );
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={selectedDocs.length === 0 || isVerifying}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify Selected'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 