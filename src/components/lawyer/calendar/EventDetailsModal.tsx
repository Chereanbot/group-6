import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { HiX } from 'react-icons/hi';
import { Event } from '@/types/calendar.types';

interface Props {
  event: Event;
  onClose: () => void;
  onUpdate: () => void;
}

export function EventDetailsModal({ event, onClose, onUpdate }: Props) {
  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <Dialog.Title className="text-xl font-semibold">
                {event.title}
              </Dialog.Title>
              <button onClick={onClose}>
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {format(event.start, 'PPP')} at {format(event.start, 'p')} - {format(event.end, 'p')}
                </p>
              </div>

              {event.location && (
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                </div>
              )}

              {event.description && (
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
                </div>
              )}

              {event.participants && event.participants.length > 0 && (
                <div>
                  <h3 className="font-medium">Participants</h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {event.participants.map((participant, index) => (
                      <li key={index}>{participant}</li>
                    ))}
                  </ul>
                </div>
              )}

              {event.documents && event.documents.length > 0 && (
                <div>
                  <h3 className="font-medium">Related Documents</h3>
                  <ul className="mt-2 space-y-2">
                    {event.documents.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Edit
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 