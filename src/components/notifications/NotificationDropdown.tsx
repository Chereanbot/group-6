"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBell, HiCheck, HiOutlineTrash, HiX } from 'react-icons/hi';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SERVICE_REQUEST':
        return '📋';
      case 'DOCUMENT_UPLOAD':
        return '📄';
      case 'PAYMENT':
        return '💰';
      case 'APPOINTMENT':
        return '📅';
      case 'CHAT_MESSAGE':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <HiOutlineBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg 
              shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-0
                      ${!notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex-1 cursor-pointer ${
                          notification.link ? 'hover:text-primary-600' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{getNotificationIcon(notification.type)}</span>
                          <h4 className="font-medium">{notification.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="flex items-start space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Mark as read"
                          >
                            <HiCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                          title="Delete"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown; 