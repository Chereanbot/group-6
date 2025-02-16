"use client";

import { useState } from 'react';
import { User } from '@/types';
import { toast } from 'react-hot-toast';
import { HiOutlinePhone, HiOutlinePaperAirplane, HiOutlineX } from 'react-icons/hi';

interface SendSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function SendSMSModal({ isOpen, onClose, user }: SendSMSModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [templates] = useState([
    (user: User) => `Hi ${user.fullName}, your appointment has been confirmed.`,
    (user: User) => `Dear ${user.fullName}, your case has been updated.`,
    (user: User) => `Hello ${user.fullName}, please review and sign the documents.`,
    (user: User) => `Hi ${user.fullName}, your meeting is scheduled for tomorrow.`,
  ]);

  if (!isOpen || !user) return null;

  const getAuthHeader = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return null;
      }
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      toast.error('Failed to get authentication token');
      return null;
    }
  };

  const handleSendSMS = async () => {
    if (!user.phone) {
      toast.error('User does not have a phone number');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const headers = getAuthHeader();
    if (!headers) {
      onClose();
      return;
    }

    setIsSending(true);

    try {
      const formattedPhone = user.phone.startsWith('+') 
        ? user.phone 
        : `+${user.phone.replace(/[^\d]/g, '')}`;

      const response = await fetch('/api/messages/sms', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: formattedPhone,
          message: message.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      if (data.success) {
        toast.success('SMS sent successfully');
        setMessage('');
        onClose();
      } else {
        throw new Error(data.error || 'Failed to send SMS');
      }
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast.error(error.message || 'Something went wrong! Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateClick = (template: (user: User) => string) => {
    setMessage(template(user));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <HiOutlinePhone className="w-5 h-5 mr-2" />
              Send SMS
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Recipient: {user.fullName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Phone: {user.phone || 'No phone number available'}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateClick(template)}
                  className="text-left text-sm p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {template(user)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Type your message here..."
            />
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Characters: {message.length} / 160
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSendSMS}
              disabled={isSending || !message.trim() || !user.phone}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
              ) : (
                <HiOutlinePaperAirplane className="w-5 h-5 mr-2" />
              )}
              Send SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 