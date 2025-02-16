"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineChat,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineStar,
  HiOutlineArchive,
  HiOutlineTrash,
  HiOutlineDotsVertical,
  HiOutlineEmojiHappy,
  HiOutlinePaperClip,
  HiOutlinePaperAirplane,
} from 'react-icons/hi';
import { MessageCategory, MessagePriority, MessageStatus, UserRoleEnum } from '@prisma/client';

interface Message {
  id: string;
  subject?: string;
  content?: string;
  text?: string;
  senderId: string;
  recipientId?: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  priority: MessagePriority;
  category: MessageCategory;
  status: MessageStatus;
  createdAt: string;
  sender: {
    fullName: string;
    email: string;
    userRole: UserRoleEnum;
  };
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAdmin();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/admin/messages');
    } else if (user) {
      loadMessages();
    }
  }, [user, authLoading, router]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedMessage.senderId,
          content: replyText,
          category: MessageCategory.GENERAL,
          priority: MessagePriority.MEDIUM,

        }),
      });

      if (response.ok) {
        setReplyText('');
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'starred') return message.isStarred;
    if (filter === 'archived') return message.isArchived;
    if (filter === 'unread') return !message.isRead;
    return true;
  }).filter(message =>
    searchQuery
      ? message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="p-4">
          <button
            onClick={() => {/* Open new message modal */}}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <HiOutlineChat className="w-5 h-5" />
            <span>New Message</span>
          </button>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => setFilter('all')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                filter === 'all' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <HiOutlineMail className="w-5 h-5" />
              <span>All Messages</span>
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                filter === 'unread' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <HiOutlineChat className="w-5 h-5" />
              <span>Unread</span>
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                filter === 'starred' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <HiOutlineStar className="w-5 h-5" />
              <span>Starred</span>
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                filter === 'archived' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <HiOutlineArchive className="w-5 h-5" />
              <span>Archived</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedMessage(message)}
              className={`p-4 border-b dark:border-gray-700 cursor-pointer ${
                selectedMessage?.id === message.id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${!message.isRead ? 'bg-white dark:bg-gray-800' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {message.sender.fullName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-white">
                      {message.sender.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {message.subject || message.text?.slice(0, 50)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(message.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message View */}
        {selectedMessage && (
          <div className="h-1/2 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">
                    {selectedMessage.subject}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    From: {selectedMessage.sender.fullName} ({selectedMessage.sender.email})
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <HiOutlineStar className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <HiOutlineArchive className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 overflow-auto">
              <div className="prose dark:prose-invert max-w-none">
                {selectedMessage.content || selectedMessage.text}
              </div>
            </div>

            <div className="p-4 border-t dark:border-gray-700">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <HiOutlineEmojiHappy className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <HiOutlinePaperClip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    <HiOutlinePaperAirplane className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 