import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiX, HiCheck } from 'react-icons/hi';
import { formatRelativeTime } from '../utils/dateUtils';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const NotificationsPanel = ({
  notifications,
  onMarkAsRead,
  onDismiss
}: NotificationsPanelProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <HiBell className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Notifications</h2>
          {notifications.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {displayedNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative border rounded-lg p-4 ${getNotificationColor(notification.type)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{notification.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 inline-block">
                  {formatRelativeTime(new Date(notification.createdAt))}
                </span>
              </div>
              <div className="flex space-x-2">
                {!notification.read && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onMarkAsRead(notification.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    title="Mark as read"
                  >
                    <HiCheck className="w-4 h-4 text-green-500" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDismiss(notification.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Dismiss"
                >
                  <HiX className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {notifications.length > 5 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-2 px-4 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          {showAll ? 'Show Less' : `Show All (${notifications.length})`}
        </motion.button>
      )}

      {notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          <p>No notifications at the moment</p>
        </motion.div>
      )}
    </div>
  );
}; 