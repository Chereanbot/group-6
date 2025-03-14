import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Coordinator } from '@/types/coordinator';

export interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'block' | 'ban', reason: string) => void;
  loading: boolean;
  coordinator: Coordinator | null;
}

export function BlockModal({ isOpen, onClose, onConfirm, loading, coordinator }: BlockModalProps) {
  const [action, setAction] = useState<'block' | 'ban'>('block');
  const [reason, setReason] = useState('');

  if (!coordinator) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white dark:bg-gray-800 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HiOutlineExclamationCircle className="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                {action === 'block' ? 'Block' : 'Ban'} Coordinator
              </Dialog.Title>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to {action} {coordinator.user.fullName}?
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'block' | 'ban')}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="block">Block</option>
                <option value="ban">Ban</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              onClick={() => onConfirm(action, reason)}
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Processing...' : action === 'block' ? 'Block' : 'Ban'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 