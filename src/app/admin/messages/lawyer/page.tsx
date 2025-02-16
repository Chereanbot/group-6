"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineChat,
  HiOutlineMail,
  HiOutlineStar,
  HiOutlineArchive,
  HiOutlineTrash,
  HiOutlineEmojiHappy,
  HiOutlinePaperClip,
  HiOutlinePaperAirplane,
  HiOutlineBriefcase,
  HiOutlineScale,
  HiOutlineClipboardList,
  HiOutlinePhone,
} from 'react-icons/hi';
import { MessageCategory, MessagePriority, MessageStatus, UserRoleEnum } from '@prisma/client';
import ComposeMessageModal from '@/components/admin/messages/ComposeMessageModal';
import LawyerList from '@/components/admin/messages/LawyerList';
import { toast } from 'react-hot-toast';

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
  recipient?: {
    fullName: string;
    email: string;
    userRole: UserRoleEnum;
  };
  caseId?: string;
  case?: {
    title: string;
    category: string;
  };
}

interface Lawyer {
  id: string;
  fullName: string;
  email: string;
  userRole: UserRoleEnum;
  lawyerProfile?: {
    specializations: string[];
    experience: number;
    phoneNumber?: string;
  };
}

export default function LawyerMessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthorized } = useAdmin();
  const [messages, setMessages] = useState<Message[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [messageChannel, setMessageChannel] = useState<'web' | 'email' | 'sms'>('web');

  useEffect(() => {
    console.log('Auth state:', { user, authLoading });
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin/messages/lawyer');
      } else if (!isAuthorized([UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN])) {
        toast.error('You are not authorized to access this page');
        router.push('/admin');
      } else {
        loadLawyers();
      }
    }
  }, [user, authLoading, router, isAuthorized]);

  useEffect(() => {
    if (selectedLawyer) {
      loadMessages();
    }
  }, [selectedLawyer]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      setLoadingError(null);
      console.log('Loading lawyers...');
      
      const response = await fetch('/api/users?role=LAWYER');
      const data = await response.json();
      
      console.log('Lawyers response:', data);
      
      if (data.success) {
        setLawyers(data.users || []);
      } else {
        setLoadingError(data.error || 'Failed to load lawyers');
      }
    } catch (error) {
      console.error('Failed to load lawyers:', error);
      setLoadingError('Failed to load lawyers. Please try again.');
      toast.error('Failed to load lawyers');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedLawyer) return;

    try {
      setLoading(true);
      setLoadingError(null);
      console.log('Loading messages for lawyer:', selectedLawyer.id);
      
      const response = await fetch(`/api/messages/lawyer?recipientId=${selectedLawyer.id}`);
      const data = await response.json();
      
      console.log('Messages response:', data);
      
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        setLoadingError(data.error || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setLoadingError('Failed to load messages. Please try again.');
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedMessage || !selectedLawyer) return;

    try {
      let success = false;

      switch (messageChannel) {
        case 'web':
          const response = await fetch('/api/messages/lawyer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: selectedLawyer.id,
              content: replyText,
              category: MessageCategory.CASE_RELATED,
              priority: MessagePriority.NORMAL,
              caseId: selectedMessage.caseId,
            }),
          });
          success = response.ok;
          break;

        case 'email':
          // Send email using your email service
          const emailResponse = await fetch('/api/messages/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: selectedLawyer.email,
              subject: `Re: ${selectedMessage.subject || 'No Subject'}`,
              content: replyText,
            }),
          });
          success = emailResponse.ok;
          break;

        case 'sms':
          if (!selectedLawyer.lawyerProfile?.phoneNumber) {
            toast.error('Lawyer phone number not available');
            return;
          }
          // Send SMS using your SMS service
          const smsResponse = await fetch('/api/messages/sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: selectedLawyer.lawyerProfile.phoneNumber,
              message: replyText,
            }),
          });
          success = smsResponse.ok;
          break;
      }

      if (success) {
        setReplyText('');
        toast.success(`Message sent via ${messageChannel}`);
        if (messageChannel === 'web') {
          loadMessages();
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(`Failed to send message via ${messageChannel}`);
    }
  };

  const handleSelectLawyer = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setSelectedMessage(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400">{loadingError}</p>
          <button
            onClick={() => loadLawyers()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!loading && lawyers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Lawyers Found</h3>
          <p className="text-gray-600 dark:text-gray-400">There are no lawyers registered in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Lawyer List */}
      <div className="w-1/3 border-r dark:border-gray-700">
        <LawyerList
          lawyers={lawyers}
          onSelectLawyer={handleSelectLawyer}
          selectedLawyerId={selectedLawyer?.id}
        />
      </div>

      {selectedLawyer ? (
        <div className="flex-1 flex flex-col">
          {/* Message List */}
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold dark:text-white">{selectedLawyer.fullName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedLawyer.email} • {selectedLawyer.lawyerProfile?.specializations.join(', ')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMessageChannel('web')}
                  className={`p-2 rounded-lg ${
                    messageChannel === 'web'
                      ? 'bg-primary-100 text-primary-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <HiOutlineChat className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setMessageChannel('email');
                    window.location.href = `mailto:${selectedLawyer.email}`;
                  }}
                  className={`p-2 rounded-lg ${
                    messageChannel === 'email'
                      ? 'bg-primary-100 text-primary-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <HiOutlineMail className="w-5 h-5" />
                </button>
                {selectedLawyer.lawyerProfile?.phoneNumber && (
                  <button
                    onClick={() => {
                      setMessageChannel('sms');
                      window.location.href = `sms:${selectedLawyer.lawyerProfile?.phoneNumber}`;
                    }}
                    className={`p-2 rounded-lg ${
                      messageChannel === 'sms'
                        ? 'bg-primary-100 text-primary-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <HiOutlinePhone className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 border-b dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages, cases, or lawyers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.isRead) {
                      handleUpdateMessage(message.id, { isRead: true });
                    }
                  }}
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
                          {message.case && (
                            <span className="ml-2 text-sm text-gray-500">
                              - Case: {message.case.title}
                            </span>
                          )}
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
                      <h2 className="text-xl font-bold dark:text-white flex items-center">
                        {selectedMessage.subject}
                        {selectedMessage.priority === MessagePriority.HIGH && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            High Priority
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From: {selectedMessage.sender.fullName} ({selectedMessage.sender.email})
                        {selectedMessage.case && (
                          <span className="ml-2">
                            - Case: {selectedMessage.case.title}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateMessage(selectedMessage.id, { isStarred: !selectedMessage.isStarred })}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full ${
                          selectedMessage.isStarred ? 'text-yellow-500' : ''
                        }`}
                      >
                        <HiOutlineStar className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateMessage(selectedMessage.id, { isArchived: !selectedMessage.isArchived })}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <HiOutlineArchive className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await fetch(`/api/messages/lawyer?id=${selectedMessage.id}`, { method: 'DELETE' });
                            setSelectedMessage(null);
                            loadMessages();
                          } catch (error) {
                            console.error('Failed to delete message:', error);
                          }
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
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
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-bold dark:text-white mb-2">Select a Lawyer</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Choose a lawyer from the list to view messages and start a conversation
            </p>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {showComposeModal && (
        <ComposeMessageModal
          onClose={() => setShowComposeModal(false)}
          onSend={handleComposeMessage}
          recipients={[selectedLawyer!]}
          currentUser={user}
        />
      )}
    </div>
  );
} 