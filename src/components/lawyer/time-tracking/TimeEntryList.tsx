"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { TimeEntry } from '@/app/lawyer/time-tracking/page';
import { 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineClock, 
  HiOutlineCash,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface Props {
  entries: TimeEntry[];
  onEntryUpdate: () => void;
}

export function TimeEntryList({ entries, onEntryUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimeEntry>>({});

  const handleEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditForm(entry);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/lawyer/time-entries/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast.success('Entry updated successfully');
        onEntryUpdate();
        setEditingId(null);
      } else {
        throw new Error('Failed to update entry');
      }
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast.error('Failed to update entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      const response = await fetch(`/api/lawyer/time-entries/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Entry deleted successfully');
        onEntryUpdate();
      } else {
        throw new Error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Case
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {entries.map(entry => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {entry.caseName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                    <HiOutlineClock className="w-4 h-4 mr-1" />
                    {formatDuration(entry.duration)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${entry.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                    entry.status === 'RUNNING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.billable && (
                    <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                      <HiOutlineCash className="w-4 h-4 mr-1" />
                      ${((entry.duration / 3600) * entry.rate).toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === entry.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                      >
                        <HiOutlineCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        <HiOutlineX className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 