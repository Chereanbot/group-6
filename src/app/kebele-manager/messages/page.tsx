"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineSearch, HiOutlinePlusCircle } from 'react-icons/hi';
import { useMessages } from '../contexts/MessageContext';

interface Message {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function KebeleManagerMessages() {
  const router = useRouter();
  const { messages, loading, error, markAsRead, deleteMessage } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status: 'READ' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    await deleteMessage(id);
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <HiOutlineMail className="text-2xl text-blue-600 dark:text-blue-400 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Messages
            </h1>
          </div>
          <button
            onClick={() => router.push('/kebele-manager/messages/compose')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <HiOutlinePlusCircle className="mr-2" />
            Compose Message
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No messages found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {filteredMessages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {message.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      message.priority === 'HIGH' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : message.priority === 'LOW'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {message.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {message.content}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      message.status === 'UNREAD'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedMessage.title}
                  </h2>
                  <div className="flex space-x-2">
                    {selectedMessage.status === 'UNREAD' && (
                      <button
                        onClick={() => handleMarkAsRead(selectedMessage.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                      >
                        <HiOutlinePencilAlt className="text-xl" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                    >
                      <HiOutlineTrash className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {selectedMessage.content}
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
} 