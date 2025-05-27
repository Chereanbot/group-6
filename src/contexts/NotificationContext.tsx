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

      // Using try-catch to handle potential network errors
      try {
        const response = await fetch('/api/notifications', {
          credentials: 'include'
        });

        // Handle HTTP errors
        if (!response.ok) {
          // For 401/403 errors, we can handle them silently since the user might not be logged in yet
          if (response.status === 401 || response.status === 403 || response.status === 402) {
            console.log('User not authenticated for notifications');
            setNotifications([]);
            setUnreadCount(0);
            return;
          }
          
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount((data.notifications || []).filter((n: Notification) => n.status === 'UNREAD').length);
        } else {
          throw new Error(data.error || 'Failed to fetch notifications');
        }
      } catch (networkError) {
        // Handle network errors (like CORS, network disconnection)
        console.warn('Network error when fetching notifications:', networkError);
        // We'll set empty notifications but not show an error to the user
        // as this is likely due to auth issues or API not being available
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error in notification processing:', error);
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