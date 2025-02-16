"use client";

import { useEffect, useState } from 'react';
import { verificationService } from '@/services/verification.service';
import { formatDate } from '@/utils/date';

interface ReminderHistoryProps {
  requestId: string;
}

export function ReminderHistory({ requestId }: ReminderHistoryProps) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await verificationService.getReminderHistory(requestId);
        setReminders(response.reminders);
      } catch (error) {
        console.error('Error loading reminder history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [requestId]);

  if (loading) {
    return <div className="text-center py-4">Loading history...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Reminder History</h3>
      {reminders.length === 0 ? (
        <p className="text-gray-500">No reminders sent yet</p>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {reminder.type} Reminder
                    <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${
                      reminder.status === 'SENT' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reminder.status}
                    </span>
                  </p>
                  {reminder.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {reminder.message}
                    </p>
                  )}
                </div>
                <time className="text-sm text-gray-500">
                  {formatDate(reminder.createdAt)}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 