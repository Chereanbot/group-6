"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import { AgentNotification } from '@/lib/agents/types';

interface AgentNotificationsProps {
  onClose: () => void;
}

export const AgentNotifications = ({ onClose }: AgentNotificationsProps) => {
  const [notifications, setNotifications] = useState<AgentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/coordinator/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/coordinator/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Agent Notifications
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No notifications
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-4 p-4 rounded-lg ${
                  notification.read
                    ? 'bg-gray-50 dark:bg-gray-700'
                    : 'bg-white dark:bg-gray-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                          notification.priority
                        )}`}
                      >
                        {notification.priority}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <HiOutlineCheck className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
