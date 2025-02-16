"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Appeal } from '@/types/appeal.types';
import { formatDate } from '@/utils/date';
import { HiOutlineDownload, HiOutlineExternalLink } from 'react-icons/hi';

interface ViewAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  appeal: Appeal;
}

export function ViewAppealModal({ isOpen, onClose, appeal }: ViewAppealModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'HEARD':
        return 'bg-purple-100 text-purple-800';
      case 'DECIDED':
        return 'bg-green-100 text-green-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Appeal Details
                </Dialog.Title>

                <div className="mt-4 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </h4>
                      <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appeal.status)}`}>
                        {appeal.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Filed Date
                      </h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(appeal.filedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Case Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Related Case
                    </h4>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {appeal.case.title}
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appeal.case.status)}`}>
                          {appeal.case.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Priority: {appeal.case.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Appeal Content */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </h4>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {appeal.description}
                    </p>
                  </div>

                  {/* Hearing Information */}
                  {appeal.hearingDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Hearing Date
                      </h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(appeal.hearingDate)}
                      </p>
                    </div>
                  )}

                  {/* Decision */}
                  {appeal.decision && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Decision
                      </h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {appeal.decision}
                      </p>
                      {appeal.decidedAt && (
                        <p className="mt-1 text-xs text-gray-500">
                          Decided on: {formatDate(appeal.decidedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Documents */}
                  {appeal.documents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Documents
                      </h4>
                      <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                        {appeal.documents.map((doc) => (
                          <li key={doc.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {doc.title}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDate(doc.uploadedAt)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => window.open(doc.path, '_blank')}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                <HiOutlineExternalLink className="w-5 h-5" />
                              </button>
                              <a
                                href={doc.path}
                                download
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                <HiOutlineDownload className="w-5 h-5" />
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 