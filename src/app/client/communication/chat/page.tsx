"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePaperClip,
  HiOutlineEmojiHappy,
  HiOutlineMicrophone,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineDotsVertical,
  HiOutlineSearch,
  HiOutlineUserCircle,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineChatAlt2,
  HiX,
  HiCheck,
  HiCheckCircle
} from 'react-icons/hi';

interface Message {
  id: string;
  content: string;
  sender: string;
  senderType: 'client' | 'lawyer' | 'coordinator';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'document' | 'voice';
    url: string;
    name: string;
  }[];
}

interface ChatContact {
  id: string;
  name: string;
  role: 'lawyer' | 'coordinator';
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
  unreadCount?: number;
}

const mockContacts: ChatContact[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'lawyer',
    avatar: '/avatars/lawyer1.jpg',
    status: 'online',
    unreadCount: 3
  },
  {
    id: '2',
    name: 'Sarah Smith',
    role: 'coordinator',
    avatar: '/avatars/coordinator1.jpg',
    status: 'offline',
    lastSeen: '2 hours ago'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    sender: 'John Doe',
    senderType: 'lawyer',
    timestamp: '10:30 AM',
    status: 'read'
  },
  {
    id: '2',
    content: 'I have a question about my case documents.',
    sender: 'Client',
    senderType: 'client',
    timestamp: '10:31 AM',
    status: 'read'
  },
  {
    id: '3',
    content: 'Here are the updated documents for your review.',
    sender: 'John Doe',
    senderType: 'lawyer',
    timestamp: '10:32 AM',
    status: 'read',
    attachments: [
      {
        type: 'document',
        url: '/documents/case123.pdf',
        name: 'Case Summary.pdf'
      }
    ]
  }
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [contacts, setContacts] = useState<ChatContact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactInfo, setShowContactInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() && !isRecording) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      sender: 'Client',
      senderType: 'client',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    setIsRecording(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <HiCheck className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <HiCheck className="w-4 h-4 text-blue-500" />;
      case 'read':
        return <HiCheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800
                focus:ring-2 focus:ring-primary-500 border-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <motion.button
              key={contact.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-50 
                dark:hover:bg-gray-800 transition-colors relative
                ${selectedContact?.id === contact.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
            >
              <div className="relative">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full
                  ${contact.status === 'online' ? 'bg-green-500' : 
                    contact.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium truncate">{contact.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {contact.role}
                    </p>
                  </div>
                  {contact.unreadCount && (
                    <span className="bg-primary-500 text-white text-xs rounded-full 
                      w-5 h-5 flex items-center justify-center">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
                {contact.status === 'offline' && contact.lastSeen && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last seen {contact.lastSeen}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-16 border-b border-gray-200 dark:border-gray-700 
            flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <img
                src={selectedContact.avatar}
                alt={selectedContact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-medium">{selectedContact.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedContact.status === 'online' ? 'Online' : 
                    `Last seen ${selectedContact.lastSeen}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <HiOutlinePhone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <HiOutlineVideoCamera className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <HiOutlineDotsVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.senderType === 'client' ? 'order-1' : ''}`}>
                  <div className={`rounded-lg p-4 ${
                    message.senderType === 'client'
                      ? 'bg-primary-500 text-white ml-auto'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {message.content}
                    {message.attachments?.map((attachment, index) => (
                      <div
                        key={index}
                        className="mt-2 p-2 rounded bg-white/10 dark:bg-black/10 
                          flex items-center space-x-2"
                      >
                        {attachment.type === 'document' ? (
                          <HiOutlineDocumentText className="w-5 h-5" />
                        ) : attachment.type === 'image' ? (
                          <HiOutlinePhotograph className="w-5 h-5" />
                        ) : (
                          <HiOutlineMicrophone className="w-5 h-5" />
                        )}
                        <span className="text-sm truncate">{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className={`flex items-center space-x-2 mt-1
                    ${message.senderType === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {message.timestamp}
                    </span>
                    {message.senderType === 'client' && getStatusIcon(message.status)}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-800 
                    focus:ring-2 focus:ring-primary-500 border-none resize-none
                    max-h-32"
                  rows={1}
                />
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  >
                    <HiOutlineEmojiHappy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  >
                    <HiOutlinePaperClip className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                className="p-4 bg-primary-500 text-white rounded-full
                  hover:bg-primary-600 transition-colors"
              >
                {isRecording ? (
                  <HiOutlineMicrophone className="w-5 h-5" />
                ) : (
                  <HiOutlineChatAlt2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <HiOutlineUserCircle className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-medium">Select a conversation</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Choose a contact to start messaging
            </p>
          </div>
        </div>
      )}

      {/* Contact Info Sidebar */}
      <AnimatePresence>
        {showContactInfo && selectedContact && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white 
              dark:bg-gray-800 overflow-y-auto"
          >
            {/* Contact Info Content */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInterface; 