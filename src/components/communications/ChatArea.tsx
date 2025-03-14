'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Circle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userRole: string;
  status: string;
  lastSeen: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    userRole: string;
    status: string;
    lastSeen: string;
    isOnline: boolean;
  };
  recipient: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    userRole: string;
    status: string;
    lastSeen: string;
    isOnline: boolean;
  };
}

interface ChatAreaProps {
  selectedContact: Contact | null;
  userId: string;
}

export default function ChatArea({ selectedContact, userId }: ChatAreaProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (pageNum: number = 1) => {
    if (!selectedContact) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/client/messages/history?contactId=${selectedContact.id}&page=${pageNum}&limit=20`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load messages');
      }

      if (pageNum === 1) {
        setMessages(data.messages);
      } else {
        setMessages(prev => [...prev, ...data.messages]);
      }
      setHasMore(data.pagination.pages > pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !message.trim()) return;
    try {
      setSending(true);
      setError(null);
      const response = await fetch('/api/client/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          text: message.trim(),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setMessages(prev => [data, ...prev]);
      setMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container || loading || !hasMore) return;

    const { scrollTop } = container;
    if (scrollTop === 0) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (selectedContact) {
      setPage(1);
      setHasMore(true);
      loadMessages(1);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (page > 1) {
      loadMessages(page);
    }
  }, [page]);

  useEffect(() => {
    if (messages.length > 0 && page === 1) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages, page]);

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Select a contact to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Contact Header */}
      <div className="p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <h2 className="text-lg font-semibold dark:text-white">{selectedContact.fullName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedContact.isOnline ? (
                <span className="text-green-500">● Online</span>
              ) : (
                <span>
                  {selectedContact.lastSeen 
                    ? `Last seen ${format(new Date(selectedContact.lastSeen), 'PP')}` 
                    : 'Offline'}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {loading && page === 1 ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        ) : (
          <>
            {loading && page > 1 && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.senderId === userId ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg p-3',
                    msg.senderId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 dark:text-white'
                  )}
                >
                  <p className="break-words">{msg.text}</p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <span className="text-xs opacity-70">
                      {msg.createdAt ? format(new Date(msg.createdAt), 'p') : ''}
                    </span>
                    {msg.senderId === userId && (
                      <span className="text-xs">
                        {msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
        {error && (
          <div className="mb-2 text-sm text-red-500 dark:text-red-400">{error}</div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border dark:border-gray-700 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="p-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 