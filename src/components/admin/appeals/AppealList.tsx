"use client";

import { useState } from 'react';
import { Appeal, AppealStatus } from '@/types/appeal.types';
import { formatDate } from '@/utils/date';
import { UpdateAppealModal } from './UpdateAppealModal';
import { ViewAppealModal } from './ViewAppealModal';

interface AppealListProps {
  appeals: Appeal[];
  loading: boolean;
  onRefresh: () => void;
}

export function AppealList({ appeals, loading, onRefresh }: AppealListProps) {
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const getStatusColor = (status: AppealStatus) => {
    switch (status) {
      case AppealStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case AppealStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case AppealStatus.HEARD:
        return 'bg-purple-100 text-purple-800';
      case AppealStatus.DECIDED:
        return 'bg-green-100 text-green-800';
      case AppealStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Case
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Filed By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Filed Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {appeals.map((appeal) => (
            <tr key={appeal.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {appeal.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {appeal.case.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appeal.status)}`}>
                  {appeal.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {appeal.filer.fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {formatDate(appeal.filedDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button
                  onClick={() => {
                    setSelectedAppeal(appeal);
                    setIsViewModalOpen(true);
                  }}
                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedAppeal(appeal);
                    setIsUpdateModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedAppeal && (
        <>
          <UpdateAppealModal
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedAppeal(null);
            }}
            appeal={selectedAppeal}
            onUpdate={onRefresh}
          />
          <ViewAppealModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedAppeal(null);
            }}
            appeal={selectedAppeal}
          />
        </>
      )}
    </div>
  );
} 