"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Message {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface MessageContextType {
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  error: string;
  fetchMessages: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    try {
      const kebeleId = localStorage.getItem('kebeleId');
      if (!kebeleId) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/kebele-manager/messages?kebeleId=${kebeleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/kebele-manager/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'READ' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, status: 'READ' } : msg
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/kebele-manager/messages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = messages.filter(msg => msg.status === 'UNREAD').length;

  const value = {
    messages,
    unreadCount,
    loading,
    error,
    fetchMessages,
    markAsRead,
    deleteMessage,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
} 