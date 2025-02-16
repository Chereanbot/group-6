"use client";

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { ServiceRequest } from '@/types/service.types';
import { formatCurrency } from '@/utils/format';
import { HiOutlineDocumentText, HiOutlineCash } from 'react-icons/hi';

interface VerifyIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onVerify: (requestId: string, verified: boolean) => Promise<void>;
}

export function VerifyIncomeModal({
  isOpen,
  onClose,
  request,
  onVerify
}: VerifyIncomeModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [notes, setNotes] = useState('');

  const handleVerify = async (verified: boolean) => {
    try {
      setIsVerifying(true);
      await onVerify(request.id, verified);
      onClose();
    } catch (error) {
      console.error('Error verifying income:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Income">
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <HiOutlineCash className="w-6 h-6 text-primary-500" />
            <div>
              <h3 className="font-medium">Declared Annual Income</h3>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(request.incomeProof?.annualIncome || 0)}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {request.incomeProof?.documents?.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                  <span>{doc.title}</span>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verification Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border dark:bg-gray-800 dark:border-gray-700"
            rows={3}
            placeholder="Add any notes about the verification..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerify(false)}
            disabled={isVerifying}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => handleVerify(true)}
            disabled={isVerifying}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      </div>
    </Modal>
  );
} 