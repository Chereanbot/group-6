'use client';

import { Dialog } from '@headlessui/react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Coordinator } from '@/types/coordinator';

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  coordinator: Coordinator | null;
}

export function DeleteModal({ isOpen, onClose, onConfirm, loading, coordinator }: DeleteModalProps) {
  if (!coordinator) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HiOutlineExclamationCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                Delete Coordinator
              </Dialog.Title>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete {coordinator.user.fullName}? This action cannot be undone.
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 