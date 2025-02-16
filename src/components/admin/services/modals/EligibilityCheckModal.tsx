"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ServiceRequest } from '@/types/service.types';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/date';

interface EligibilityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onVerify: (requestId: string, isEligible: boolean) => Promise<void>;
}

export function EligibilityCheckModal({
  isOpen,
  onClose,
  request,
  onVerify
}: EligibilityCheckModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const handleVerify = async (isEligible: boolean) => {
    try {
      setIsSubmitting(true);
      await onVerify(request.id, isEligible);
      onClose();
    } catch (error) {
      console.error('Error verifying eligibility:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Legal Aid Eligibility Check
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  {/* Client Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Client Information
                    </h4>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {request.client.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.client.email}
                      </p>
                    </div>
                  </div>

                  {/* Income Information */}
                  {request.incomeProof && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Annual Income
                      </h4>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(request.incomeProof.annualIncome)}
                      </p>
                    </div>
                  )}

                  {/* Supporting Documents */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Supporting Documents
                    </h4>
                    <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                      {request.documents.map((doc) => (
                        <li key={doc.id} className="py-2 flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {doc.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                          <a
                            href={doc.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            View
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Verification Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Add any notes about the eligibility verification..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleVerify(false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Not Eligible
                    </button>
                    <button
                      onClick={() => handleVerify(true)}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Eligible
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 