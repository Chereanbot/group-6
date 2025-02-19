"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlinePaperAirplane,
  HiOutlineEmojiHappy,
  HiOutlinePaperClip,
  HiOutlineDotsVertical,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineFilter,
} from 'react-icons/hi';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  userRole: 'COORDINATOR' | 'LAWYER';
  avatar?: string;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
  badge?: string;
  badgeColor?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isRead?: boolean;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  recipient: {
    id: string;
    name: string;
    role: string;
  };
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAdmin();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'COORDINATOR' | 'LAWYER'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkAuthAndLoadContacts = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No auth token found');
          router.push('/login');
          return;
        }

        // Verify token with proper headers
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || 'Token verification failed');
        }

        const verifyData = await verifyResponse.json();

        if (!verifyData.isAuthenticated || !verifyData.user?.isAdmin) {
          console.error('User not authenticated or not admin');
          router.push('/login');
          return;
        }

        // Store user data
        localStorage.setItem('user', JSON.stringify(verifyData.user));

        // Load contacts based on active tab with proper auth headers
        if (activeTab === 'ALL') {
          await loadAllContacts(token);
        } else {
          await loadContacts(token);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed. Please login again.');
        router.push('/login');
      }
    };

    checkAuthAndLoadContacts();
  }, [activeTab, router]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
      startPolling(selectedContact.id);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContacts = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users?role=${activeTab}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch contacts: Invalid response format');
      }

      const processedContacts = data.users.map((user: any) => ({
        ...user,
        unreadCount: 0,
        badge: activeTab === 'COORDINATOR' ? 'Coordinator' : 'Lawyer',
        badgeColor: activeTab === 'COORDINATOR' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
      }));
      setContacts(processedContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load contacts. Please try again.';
      setError(errorMessage);
      
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllContacts = async (token: string) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [coordinatorResponse, lawyerResponse] = await Promise.all([
        fetch('/api/users?role=COORDINATOR', {
          method: 'GET',
          headers
        }),
        fetch('/api/users?role=LAWYER', {
          method: 'GET',
          headers
        })
      ]);
      
      // Parse responses
      const coordData = await coordinatorResponse.json();
      const lawyerData = await lawyerResponse.json();

      // Check for error responses
      if (!coordinatorResponse.ok || !lawyerResponse.ok) {
        const errorMessage = coordData.error || lawyerData.error || 
          `Failed to fetch contacts. Status: ${coordinatorResponse.status}, ${lawyerResponse.status}`;
        
        if (coordinatorResponse.status === 401 || lawyerResponse.status === 401) {
          console.error('Authentication failed:', errorMessage);
          router.push('/login');
          return;
        }
        
        throw new Error(errorMessage);
      }

      // Validate response format
      if (!coordData.success || !lawyerData.success) {
        throw new Error('Invalid response format from server');
      }

      const coordinators = coordData.users.map((user: any) => ({
        ...user,
        unreadCount: 0,
        badge: 'Coordinator',
        badgeColor: 'bg-blue-100 text-blue-800'
      }));

      const lawyers = lawyerData.users.map((user: any) => ({
        ...user,
        unreadCount: 0,
        badge: 'Lawyer',
        badgeColor: 'bg-green-100 text-green-800'
      }));

      const allUsers = [...coordinators, ...lawyers].sort((a, b) => 
        a.fullName.localeCompare(b.fullName)
      );
      
      setAllContacts(allUsers);
      setContacts(allUsers);
    } catch (error) {
      console.error('Failed to load all contacts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load contacts. Please try again.';
      setError(errorMessage);
      
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatLastSeen = (lastSeen: Date | null): string => {
    if (!lastSeen) return 'Never';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  const loadMessages = async (contactId: string) => {
    try {
      setLoading(true);
      setError(null);
      setLastMessageTimestamp(null);
      setMessages([]); // Clear existing messages when loading new conversation
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/messages?userId=${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed');
          router.push('/login');
          return;
        }
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to load messages: Invalid response format');
      }

      // Update contact's unread count
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? { 
                ...contact, 
                unreadCount: data.metadata.unreadCount,
                lastMessage: data.messages[data.messages.length - 1] ? {
                  content: data.messages[data.messages.length - 1].content,
                  timestamp: new Date(data.messages[data.messages.length - 1].timestamp)
                } : undefined
              }
            : contact
        )
      );

      // Set messages
      const processedMessages = data.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        timestamp: new Date(msg.timestamp),
        status: msg.status || 'SENT',
        isRead: Boolean(msg.isRead),
        sender: msg.sender,
        recipient: msg.recipient
      }));

      setMessages(processedMessages);
      if (processedMessages.length > 0) {
        setLastMessageTimestamp(processedMessages[processedMessages.length - 1].timestamp.toISOString());
      }
      scrollToBottom();

    } catch (error) {
      console.error('Failed to load messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedContact) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageInput,
          recipientId: selectedContact.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to send message: Invalid response format');
      }

      // Add the new message to the list
      const newMessage = {
        id: data.message.id,
        content: data.message.content,
        senderId: data.message.senderId,
        recipientId: data.message.recipientId,
        timestamp: new Date(data.message.timestamp),
        status: 'SENT',
        isRead: false,
        sender: data.message.sender,
        recipient: data.message.recipient
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setLastMessageTimestamp(newMessage.timestamp.toISOString());

      // Update contact's last message
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === selectedContact.id 
            ? { 
                ...contact, 
                lastMessage: {
                  content: newMessage.content,
                  timestamp: newMessage.timestamp
                }
              }
            : contact
        )
      );

      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  // Add this function to handle message status updates
  const updateMessageStatus = async (messageId: string, status: 'read' | 'delivered') => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      await fetch(`/api/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Failed to update message status:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startPolling = (contactId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    pollingIntervalRef.current = setInterval(() => {
      pollNewMessages(contactId);
    }, 3000); // Poll every 3 seconds
  };

  const pollNewMessages = async (contactId: string) => {
    if (!lastMessageTimestamp) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        router.push('/login');
        return;
      }

      const response = await fetch(
        `/api/messages?userId=${contactId}&lastMessageTimestamp=${lastMessageTimestamp}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed');
          router.push('/login');
          return;
        }
        throw new Error(`Failed to poll messages: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to poll messages: Invalid response format');
      }

      if (data.messages.length > 0) {
        // Process and add only new messages
        const newMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          recipientId: msg.recipientId,
          timestamp: new Date(msg.timestamp),
          status: (msg.status as 'sent' | 'delivered' | 'read') || 'sent',
          isRead: Boolean(msg.isRead),
          sender: {
            id: msg.sender.id,
            name: msg.sender.name,
            role: msg.sender.role
          },
          recipient: {
            id: msg.recipient.id,
            name: msg.recipient.name,
            role: msg.recipient.role
          }
        }));

        // Update messages state with new messages
        setMessages(prevMessages => {
          const uniqueMessages = [...prevMessages];
          newMessages.forEach(newMsg => {
            if (!uniqueMessages.some(msg => msg.id === newMsg.id)) {
              uniqueMessages.push(newMsg);
            }
          });
          return uniqueMessages;
        });

        // Update last message timestamp
        setLastMessageTimestamp(newMessages[newMessages.length - 1].timestamp.toISOString());
        
        // Update contact's unread count and last message
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact.id === contactId 
              ? { 
                  ...contact, 
                  unreadCount: data.metadata.unreadCount,
                  lastMessage: {
                    content: newMessages[newMessages.length - 1].content,
                    timestamp: newMessages[newMessages.length - 1].timestamp
                  }
                }
              : contact
          )
        );

        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to poll messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to poll messages');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Contacts */}
      <div className="w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-6">
          {/* Search Bar with enhanced styling */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 
                border-none focus:ring-2 focus:ring-primary-500 transition-all duration-300
                text-gray-700 dark:text-gray-200 placeholder-gray-500"
            />
            <HiOutlineSearch className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <button className="absolute right-4 top-3.5 text-gray-400 hover:text-primary-500 transition-colors">
              <HiOutlineFilter className="w-5 h-5" />
            </button>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <motion.button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                flex items-center justify-center space-x-2 ${
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
              }`}
              whileHover={{ scale: activeTab === 'ALL' ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiOutlineUserGroup className="w-4 h-4" />
              <span>All</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('COORDINATOR')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                flex items-center justify-center space-x-2 ${
                activeTab === 'COORDINATOR'
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
              }`}
              whileHover={{ scale: activeTab === 'COORDINATOR' ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiOutlineUserGroup className="w-4 h-4" />
              <span>Coordinators</span>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('LAWYER')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                flex items-center justify-center space-x-2 ${
                activeTab === 'LAWYER'
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
              }`}
              whileHover={{ scale: activeTab === 'LAWYER' ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiOutlineBriefcase className="w-4 h-4" />
              <span>Lawyers</span>
            </motion.button>
          </div>

          {/* Contacts List with enhanced animations */}
          <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar">
            {loading ? (
              // Enhanced loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
              ))
            ) : (
              <AnimatePresence>
                {filteredContacts.map((contact, index) => (
                  <motion.button
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200
                      ${selectedContact?.id === contact.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 shadow-md'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
          <div className="relative">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.fullName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2
                            ring-gray-200 dark:ring-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                          flex items-center justify-center text-lg font-medium text-white shadow-lg">
                          {contact.fullName.charAt(0)}
          </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                  <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {contact.fullName}
                    </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium
                              ${contact.badgeColor} shadow-sm`}>
                              {contact.badge}
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {contact.email}
                    </p>
                  </div>
                </div>
                        {contact.unreadCount > 0 && (
                          <span className="px-2 py-1 text-xs bg-primary-500 text-white rounded-full
                            font-medium shadow-sm">
                            {contact.unreadCount}
                          </span>
                        )}
                </div>
                      {contact.lastMessage && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                          {contact.lastMessage.content}
                        </p>
                      )}
              </div>
                  </motion.button>
          ))}
              </AnimatePresence>
            )}
          </div>
        </div>
                </div>

      {/* Right Side - Chat Area with enhanced styling */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-l-xl shadow-xl">
          {/* Enhanced Chat Header */}
          <div className="h-20 px-6 flex items-center justify-between 
            bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
            rounded-tl-xl shadow-sm">
            <div className="flex items-center space-x-4">
              {selectedContact.avatar ? (
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2
                    ring-gray-200 dark:ring-gray-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                  flex items-center justify-center text-lg font-medium text-white shadow-lg">
                  {selectedContact.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedContact.fullName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedContact.badge}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  text-gray-600 dark:text-gray-300 transition-colors"
              >
                <HiOutlinePhone className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  text-gray-600 dark:text-gray-300 transition-colors"
              >
                <HiOutlineVideoCamera className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  text-gray-600 dark:text-gray-300 transition-colors"
              >
                <HiOutlineDotsVertical className="w-5 h-5" />
              </motion.button>
              </div>
            </div>

          {/* Enhanced Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {loading ? (
              // Message loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-2 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end space-x-2">
                      {message.senderId !== user?.id && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                          flex items-center justify-center text-sm font-medium text-white">
                          {message.sender.name.charAt(0)}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-6 py-4 shadow-sm
                          ${message.senderId === user?.id
                            ? 'bg-primary-500 text-white ml-auto'
                            : 'bg-gray-100 dark:bg-gray-700'
                          }`}
                      >
                        <p className="text-base">{message.content}</p>
                        <div className="flex items-center justify-end space-x-2 mt-2">
                          <p className={`text-xs ${
                            message.senderId === user?.id
                              ? 'text-primary-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {message.senderId === user?.id && (
                            <span className="text-xs text-primary-100">
                              {message.status === 'read' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Message Input */}
          <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full px-6 py-4 rounded-xl bg-gray-100 dark:bg-gray-700
                    focus:ring-2 focus:ring-primary-500 border-none resize-none
                    max-h-32 text-gray-700 dark:text-gray-200 placeholder-gray-500"
                  rows={1}
                />
                <div className="absolute right-4 bottom-3 flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                      text-gray-500 transition-colors"
                  >
                    <HiOutlineEmojiHappy className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                      text-gray-500 transition-colors"
                  >
                    <HiOutlinePaperClip className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                className="p-4 rounded-xl bg-primary-500 text-white
                  hover:bg-primary-600 transition-colors shadow-lg"
              >
                <HiOutlinePaperAirplane className="w-6 h-6 transform rotate-90" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-500 dark:text-gray-400"
          >
            <HiOutlineUserGroup className="w-24 h-24 mx-auto mb-6 text-primary-500" />
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Select a contact
            </h3>
            <p className="text-lg">Choose a contact to start messaging</p>
          </motion.div>
          </div>
        )}
    </div>
  );
} 

// Add this CSS to your global styles
const globalStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
`; 