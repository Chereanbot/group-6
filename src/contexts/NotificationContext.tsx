"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED' | 'DELETED';
  createdAt: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => n.status === 'UNREAD').length);
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id
              ? { ...notification, status: 'READ' }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(data.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError(error instanceof Error ? error.message : 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, status: 'READ' }))
        );
        setUnreadCount(0);
      } else {
        throw new Error(data.error || 'Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError(error instanceof Error ? error.message : 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        setUnreadCount(prev =>
          notifications.find(n => n.id === id)?.status === 'UNREAD'
            ? Math.max(0, prev - 1)
            : prev
        );
      } else {
        throw new Error(data.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete notification');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 