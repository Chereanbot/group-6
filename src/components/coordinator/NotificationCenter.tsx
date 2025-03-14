import { useState, useEffect } from 'react';
import {
  HiOutlineX,
  HiOutlineBell,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineExclamation,
} from 'react-icons/hi';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'document' | 'appointment' | 'case' | 'alert';
  timestamp: Date;
  read: boolean;
}

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching notifications
    const fetchNotifications = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Document Uploaded',
            message: 'A new case document has been uploaded for review.',
            type: 'document',
            timestamp: new Date(),
            read: false,
          },
          {
            id: '2',
            title: 'Upcoming Appointment',
            message: 'You have a client meeting scheduled for tomorrow at 2 PM.',
            type: 'appointment',
            timestamp: new Date(Date.now() - 3600000),
            read: true,
          },
          {
            id: '3',
            title: 'Case Update',
            message: 'Case #123 has been updated with new information.',
            type: 'case',
            timestamp: new Date(Date.now() - 7200000),
            read: false,
          },
          {
            id: '4',
            title: 'System Alert',
            message: 'Please complete your weekly report by Friday.',
            type: 'alert',
            timestamp: new Date(Date.now() - 86400000),
            read: false,
          },
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document':
        return (
          <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-full">
            <HiOutlineDocumentText className="w-5 h-5 text-blue-500" />
          </div>
        );
      case 'appointment':
        return (
          <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-full">
            <HiOutlineCalendar className="w-5 h-5 text-green-500" />
          </div>
        );
      case 'case':
        return (
          <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-full">
            <HiOutlineUserGroup className="w-5 h-5 text-purple-500" />
          </div>
        );
      case 'alert':
        return (
          <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-full">
            <HiOutlineExclamation className="w-5 h-5 text-red-500" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-500/20 p-2 rounded-full">
            <HiOutlineBell className="w-5 h-5 text-gray-500" />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    return !notification.read;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {notifications.filter((n) => !n.read).length} unread notifications
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 p-4 border-b dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg ${
                    notification.read
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No notifications found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 