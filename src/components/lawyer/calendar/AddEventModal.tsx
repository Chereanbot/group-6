'use client'

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { HiX, HiOutlineClock, HiOutlineLocationMarker, HiOutlineUserGroup } from 'react-icons/hi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onAdd: (eventData: EventData) => Promise<void>;
  initialData?: {
    start: Date;
    end: Date;
  };
}

interface EventData {
  title: string;
  type: 'HEARING' | 'APPOINTMENT' | 'MEETING' | 'DEADLINE';
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  participants?: string[];
  status: 'SCHEDULED' | 'PENDING';
}

export function AddEventModal({ onClose, onAdd, initialData }: Props) {
  const [formData, setFormData] = useState<EventData>({
    title: '',
    type: 'MEETING',
    start: initialData?.start || new Date(),
    end: initialData?.end || new Date(),
    description: '',
    location: '',
    participants: [],
    status: 'SCHEDULED'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.title) {
        toast.error('Please enter a title');
        return;
      }

      if (formData.end < formData.start) {
        toast.error('End time cannot be before start time');
        return;
      }

      setIsSubmitting(true);
      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error('Error adding event:', error);
      // Let the parent component handle the error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold">
                Add New Event
              </Dialog.Title>
              <button onClick={onClose}>
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventData['type'] })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  required
                >
                  <option value="MEETING">Meeting</option>
                  <option value="HEARING">Hearing</option>
                  <option value="APPOINTMENT">Appointment</option>
                  <option value="DEADLINE">Deadline</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <DatePicker
                    selected={formData.start}
                    onChange={(date: Date) => setFormData({ ...formData, start: date })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    minDate={new Date()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <DatePicker
                    selected={formData.end}
                    onChange={(date: Date) => setFormData({ ...formData, end: date })}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    minDate={formData.start}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Add event description..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 