import { Dialog } from '@headlessui/react';
import { HiX } from 'react-icons/hi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFilterChange: (filters: any) => void;
}

export function FilterPanel({ isOpen, onClose, filters, onFilterChange }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 flex max-w-xs">
        <Dialog.Panel className="w-screen max-w-md bg-white dark:bg-gray-800 shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Filter Events</h3>
              <button onClick={onClose}>
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Event Types */}
              <div>
                <h4 className="font-medium mb-2">Event Type</h4>
                <div className="space-y-2">
                  {['HEARING', 'APPOINTMENT', 'MEETING', 'DEADLINE'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.types, type]
                            : filters.types.filter(t => t !== type);
                          onFilterChange({ ...filters, types: newTypes });
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-2">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-2">
                  {['SCHEDULED', 'COMPLETED', 'CANCELLED', 'PENDING'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status]
                            : filters.status.filter(s => s !== status);
                          onFilterChange({ ...filters, status: newStatus });
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="ml-2">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 