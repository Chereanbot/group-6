"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSearch,
  HiOutlineUserCircle,
  HiOutlinePaperClip,
  HiOutlineEmojiHappy,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineInformationCircle,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiCheck,
  HiCheckCircle,
  HiOutlineDotsVertical,
  HiOutlinePaperAirplane
} from 'react-icons/hi';

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'other';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  };
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Lawyer',
    status: 'online',
    lastMessage: "I have reviewed your case documents...",
    lastMessageTime: '10:30 AM',
    unreadCount: 2
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    role: 'Case Coordinator',
    status: 'offline',
    lastMessage: 'Your appointment has been scheduled',
    lastMessageTime: 'Yesterday'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    sender: 'other',
    timestamp: '10:30 AM',
    status: 'read'
  },
  {
    id: '2',
    content: 'I have some questions about my case.',
    sender: 'me',
    timestamp: '10:31 AM',
    status: 'read'
  }
];

const MessagesPage = () => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [messageInput, setMessageInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactInfo, setShowContactInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700
                border-none focus:ring-2 focus:ring-primary-500"
            />
            <HiOutlineSearch className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Contacts List */}
          <div className="space-y-2">
            {contacts.map((contact) => (
              <motion.button
                key={contact.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-3 rounded-lg flex items-start space-x-3
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${selectedContact?.id === contact.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30
                      flex items-center justify-center">
                      <HiOutlineUserCircle className="w-8 h-8 text-primary-500" />
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full
                    border-2 border-white dark:border-gray-800
                    ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {contact.role}
                      </p>
                    </div>
                    {contact.unreadCount && (
                      <span className="px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  {contact.lastMessage && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                      {contact.lastMessage}
                    </p>
                  )}
                  {contact.lastMessageTime && (
                    <p className="mt-1 text-xs text-gray-500">
                      {contact.lastMessageTime}
                    </p>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {selectedContact.avatar ? (
                  <img
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30
                    flex items-center justify-center">
                    <HiOutlineUserCircle className="w-6 h-6 text-primary-500" />
                  </div>
                )}
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full
                  border-2 border-white dark:border-gray-800
                  ${selectedContact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
              <div>
                <h2 className="font-medium">{selectedContact.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedContact.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <HiOutlinePhone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <HiOutlineVideoCamera className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <HiOutlineInformationCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-1' : ''}`}>
                  <div className={`rounded-lg p-4 ${
                    message.sender === 'me'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {message.content}
                    {message.attachment && (
                      <div className="mt-2 p-2 rounded bg-black/10 flex items-center space-x-2">
                        {message.attachment.type === 'image' ? (
                          <HiOutlinePhotograph className="w-5 h-5" />
                        ) : (
                          <HiOutlineDocumentText className="w-5 h-5" />
                        )}
                        <span className="text-sm truncate">{message.attachment.name}</span>
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center space-x-2 mt-1
                    ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                    {message.sender === 'me' && (
                      message.status === 'read' ? (
                        <HiCheckCircle className="w-4 h-4 text-primary-500" />
                      ) : (
                        <HiCheck className="w-4 h-4 text-gray-400" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800">
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
                  className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-700
                    focus:ring-2 focus:ring-primary-500 border-none resize-none
                    max-h-32"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                  <button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                  >
                    <HiOutlinePaperClip className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                    <HiOutlineEmojiHappy className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                className="p-4 bg-primary-500 text-white rounded-full
                  hover:bg-primary-600 transition-colors"
              >
                <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="text-center">
            <HiOutlineUserCircle className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-medium">Select a conversation</h2>
            <p className="mt-2 text-gray-500">
              Choose a contact to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage; 