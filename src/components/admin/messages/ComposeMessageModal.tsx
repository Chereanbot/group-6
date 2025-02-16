"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { MessageCategory, MessagePriority, UserRoleEnum } from '@prisma/client';
import { HiOutlineSearch } from 'react-icons/hi';

interface User {
  id: string;
  fullName: string;
  email: string;
  userRole: UserRoleEnum;
  lawyerProfile?: {
    specializations: string[];
    experience: number;
  };
}

interface Case {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
}

interface ComposeMessageModalProps {
  onClose: () => void;
  onSend: (data: any) => Promise<void>;
  recipients?: User[];
  currentUser?: User;
}

export default function ComposeMessageModal({ onClose, onSend, recipients = [], currentUser }: ComposeMessageModalProps) {
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    category: MessageCategory.CASE_RELATED,
    priority: MessagePriority.NORMAL,
    caseId: ''
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();
      if (data.success) {
        setCases(data.cases || []);
      }
    } catch (error) {
      console.error('Failed to load cases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (!formData.recipientId || !formData.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.category === MessageCategory.CASE_RELATED && !formData.caseId) {
        toast.error('Please select a case for case-related messages');
        return;
      }

      await onSend(formData);
      onClose();
      toast.success('Message sent successfully');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = recipients.filter(recipient =>
    searchQuery
      ? recipient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.userRole.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4 dark:text-white">Compose Message</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">To</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-2"
              />
              <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select
              value={formData.recipientId}
              onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select recipient</option>
              {filteredRecipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.fullName} ({recipient.email}) - {recipient.userRole}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as MessageCategory })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {Object.values(MessageCategory).map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {formData.category === MessageCategory.CASE_RELATED && (
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Related Case</label>
              <select
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select case</option>
                {cases.map((case_) => (
                  <option key={case_.id} value={case_.id}>
                    {case_.title} - {case_.category} ({case_.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as MessagePriority })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {Object.values(MessagePriority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Message subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Message</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={6}
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 