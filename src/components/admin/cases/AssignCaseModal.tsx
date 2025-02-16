"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Case, User } from '@/types/case.types';

interface AssignCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (caseId: string, lawyerId: string, isReassignment?: boolean) => Promise<void>;
  lawyers: User[];
  selectedCase: Case | null;
  selectedCases: string[];
  cases: Case[];
}

export function AssignCaseModal({
  isOpen,
  onClose,
  onAssign,
  lawyers,
  selectedCase,
  selectedCases,
  cases
}: AssignCaseModalProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedCase && selectedCase.lawyerId) {
      setSelectedLawyer(selectedCase.lawyerId);
    } else {
      setSelectedLawyer('');
    }
  }, [selectedCase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyer) return;

    try {
      setIsSubmitting(true);
      
      if (selectedCase) {
        // Single case assignment
        const isReassignment = !!selectedCase.lawyerId;
        await onAssign(selectedCase.id, selectedLawyer, isReassignment);
      } else if (selectedCases.length > 0 && cases) {
        // Bulk assignment
        for (const caseId of selectedCases) {
          const caseData = cases.find(c => c.id === caseId);
          if (caseData) {
            const isReassignment = !!caseData.lawyerId;
            await onAssign(caseId, selectedLawyer, isReassignment);
          }
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error assigning case(s):', error);
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
                  Assign Case
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    {selectedCase ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Case
                        </label>
                        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          {selectedCase.title}
                          {selectedCase.lawyerId && (
                            <p className="text-sm text-gray-500 mt-1">
                              Currently assigned to: {selectedCase.assignedLawyer?.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Selected Cases
                        </label>
                        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <p>{selectedCases.length} cases selected</p>
                          {cases && (
                            <p className="text-sm text-gray-500 mt-1">
                              {cases.filter(c => selectedCases.includes(c.id) && c.lawyerId).length} already assigned
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Lawyer
                      </label>
                      <select
                        value={selectedLawyer}
                        onChange={(e) => setSelectedLawyer(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                        required
                      >
                        <option value="">Select a lawyer</option>
                        {lawyers.map((lawyer) => (
                          <option 
                            key={lawyer.id} 
                            value={lawyer.id}
                            disabled={lawyer.id === selectedCase?.lawyerId}
                          >
                            {lawyer.fullName}
                            {lawyer.id === selectedCase?.lawyerId ? ' (Current)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedLawyer || isSubmitting || selectedLawyer === selectedCase?.lawyerId}
                    >
                      {isSubmitting ? 'Assigning...' : selectedCase?.lawyerId ? 'Reassign' : 'Assign'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 