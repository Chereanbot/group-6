"use client";

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { ServiceRequest } from '@/types/service.types';
import { toast } from 'react-hot-toast';
import { verificationService } from '@/services/verification.service';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onSuccess: () => void;
}

export function ReminderModal({
  isOpen,
  onClose,
  request,
  onSuccess
}: ReminderModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [reminderType, setReminderType] = useState<'EMAIL' | 'SMS' | 'WHATSAPP' | 'ALL'>('ALL');
  const [customMessage, setCustomMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // New state variables
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [category, setCategory] = useState<'GENERAL' | 'DOCUMENT' | 'PAYMENT' | 'APPOINTMENT'>('GENERAL');
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [template, setTemplate] = useState<string>('default');
  
  // Reminder preferences
  const [enableRecurring, setEnableRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'CUSTOM'>('WEEKLY');
  const [customDays, setCustomDays] = useState(7);
  const [preferredTime, setPreferredTime] = useState<string>('09:00');

  const handleSendReminder = async () => {
    try {
      setError(null);
      setIsSending(true);

      // Validate contact information
      if (!request.client?.email && !request.client?.phone && !request.contactPhone) {
        throw new Error('No contact method available');
      }

      // Validate reminder type against available contact methods
      if (reminderType === 'EMAIL' && !request.client?.email) {
        throw new Error('Email address required for email reminders');
      }

      if ((reminderType === 'SMS' || reminderType === 'WHATSAPP') && 
          !request.client?.phone && !request.contactPhone) {
        throw new Error('Phone number required for SMS/WhatsApp reminders');
      }

      // Send reminder with enhanced options
      await verificationService.sendReminder(request.id, {
        type: reminderType,
        message: customMessage,
        priority,
        category,
        scheduledFor: scheduledFor?.toISOString(),
        maxAttempts,
        tags,
        templateId: template,
        recurring: enableRecurring ? {
          frequency,
          customDays,
          preferredTime
        } : undefined
      });

      toast.success('Reminder scheduled successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error sending reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reminder';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Reminder" size="lg">
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Contact Method Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Type
            </label>
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as any)}
              className="w-full rounded-lg border dark:bg-gray-800 dark:border-gray-700 p-2"
              disabled={isSending}
            >
              <option value="ALL">All Available Methods</option>
              <option value="EMAIL">Email Only</option>
              <option value="SMS">SMS Only</option>
              <option value="WHATSAPP">WhatsApp Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full rounded-lg border dark:bg-gray-800 dark:border-gray-700 p-2"
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Scheduling */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule For
            </label>
            <DatePicker
              selected={scheduledFor}
              onChange={setScheduledFor}
              showTimeSelect
              dateFormat="Pp"
              className="w-full rounded-lg border dark:bg-gray-800 dark:border-gray-700 p-2"
              placeholderText="Select date and time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full rounded-lg border dark:bg-gray-800 dark:border-gray-700 p-2"
            >
              <option value="GENERAL">General</option>
              <option value="DOCUMENT">Document Required</option>
              <option value="PAYMENT">Payment Required</option>
              <option value="APPOINTMENT">Appointment</option>
            </select>
          </div>
        </div>

        {/* Recurring Options */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableRecurring"
              checked={enableRecurring}
              onChange={(e) => setEnableRecurring(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="enableRecurring" className="ml-2 text-sm">
              Enable Recurring Reminders
            </label>
          </div>

          {enableRecurring && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full rounded-lg border p-2"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>

              {frequency === 'CUSTOM' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Every X Days
                  </label>
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    min="1"
                    className="w-full rounded-lg border p-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-lg border p-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Message Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full rounded-lg border dark:bg-gray-800 dark:border-gray-700 p-2 mb-2"
          >
            <option value="default">Default Template</option>
            <option value="urgent">Urgent Reminder</option>
            <option value="followup">Follow-up</option>
            <option value="final">Final Notice</option>
          </select>

          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter custom message or modify template..."
            rows={4}
            disabled={isSending}
            className="w-full rounded-lg border dark:bg-gray-800 dark:border-gray-700 p-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSendReminder}
            disabled={isSending}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isSending ? 'Scheduling...' : 'Schedule Reminder'}
          </button>
        </div>
      </div>
    </Modal>
  );
} 