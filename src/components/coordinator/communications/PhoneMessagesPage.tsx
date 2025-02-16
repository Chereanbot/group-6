"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  HiOutlinePaperAirplane, 
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineCheck,
  HiOutlineX
} from 'react-icons/hi';
import { sendSMS, validatePhoneNumber, formatPhoneNumberForDisplay } from '@/services/sms';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';

type PhoneMessage = {
  id: string;
  phoneNumber: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  direction: 'incoming' | 'outgoing';
};

type PhoneContact = {
  phoneNumber: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
};

export default function PhoneMessagesPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<PhoneMessage[]>([]);
  const [recentContacts, setRecentContacts] = useState<PhoneContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const eventSource = new EventSource('/api/messages/phone/sse');

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      handleNewMessage(newMessage);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Fetch recent contacts
  useEffect(() => {
    const fetchRecentContacts = async () => {
      try {
        const response = await fetch('/api/messages/phone/contacts');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setRecentContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchRecentContacts();
  }, []);

  // Fetch messages for selected contact
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/messages/phone/${selectedContact}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedContact]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewMessage = (newMessage: PhoneMessage) => {
    setMessages(prev => [...prev, newMessage]);
    updateRecentContacts(newMessage);
  };

  const updateRecentContacts = (message: PhoneMessage) => {
    setRecentContacts(prev => {
      const existingContactIndex = prev.findIndex(
        contact => contact.phoneNumber === message.phoneNumber
      );

      const updatedContact = {
        phoneNumber: message.phoneNumber,
        lastMessage: message.content,
        lastMessageTime: message.timestamp,
        unreadCount: message.direction === 'incoming' ? 1 : 0
      };

      if (existingContactIndex >= 0) {
        const newContacts = [...prev];
        newContacts[existingContactIndex] = {
          ...newContacts[existingContactIndex],
          ...updatedContact,
          unreadCount: message.direction === 'incoming' 
            ? newContacts[existingContactIndex].unreadCount + 1 
            : 0
        };
        return newContacts;
      }

      return [updatedContact, ...prev];
    });
  };

  const handleSendMessage = async () => {
    if (!phoneNumber.trim() || !message.trim()) return;

    try {
      if (!validatePhoneNumber(phoneNumber)) {
        console.error('Invalid phone number format');
        return;
      }

      const result = await sendSMS(phoneNumber, message);
      handleNewMessage(result);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatPhoneNumber = (number: string) => {
    try {
      return formatPhoneNumberForDisplay(number);
    } catch {
      return number;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left sidebar - Recent contacts */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center space-y-4">
            <input
              type="tel"
              placeholder="Enter phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 text-center"
            />
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search phone numbers..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                  focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
              <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-9rem)]">
          {recentContacts.map((contact) => (
            <div
              key={contact.phoneNumber}
              onClick={() => {
                setSelectedContact(contact.phoneNumber);
                setPhoneNumber(contact.phoneNumber);
              }}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 
                dark:hover:bg-gray-800 transition-colors duration-200
                ${selectedContact === contact.phoneNumber ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 
                flex items-center justify-center">
                <HiOutlinePhone className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {formatPhoneNumber(contact.phoneNumber)}
                  </h3>
                  {contact.lastMessageTime && (
                    <span className="text-sm text-gray-500">
                      {new Date(contact.lastMessageTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                {contact.lastMessage && (
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                    {contact.unreadCount > 0 && (
                      <span className="bg-primary-500 text-white text-xs rounded-full 
                        px-2 py-1 min-w-[1.25rem] text-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Message area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.direction === 'outgoing'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center mt-1 space-x-1 text-xs ${
                    msg.direction === 'outgoing' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.direction === 'outgoing' && (
                      <span>
                        {msg.status === 'sending' && <HiOutlineClock className="w-4 h-4" />}
                        {msg.status === 'sent' && <HiOutlineCheck className="w-4 h-4" />}
                        {msg.status === 'delivered' && (
                          <div className="flex">
                            <HiOutlineCheck className="w-4 h-4" />
                            <HiOutlineCheck className="w-4 h-4 -ml-2" />
                          </div>
                        )}
                        {msg.status === 'failed' && <HiOutlineExclamationCircle className="w-4 h-4 text-red-500" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!phoneNumber.trim() || !message.trim()}
              className="p-2 bg-primary-500 hover:bg-primary-600 rounded-full 
                transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlinePaperAirplane className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex space-x-2 p-4">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/messages/phone/test-credentials');
                const result = await response.json();
                console.log('Twilio credentials test:', result);
                if (result.success) {
                  alert('Twilio credentials are valid!');
                } else {
                  alert('Twilio credentials error: ' + result.error);
                }
              } catch (error) {
                console.error('Test failed:', error);
                alert('Failed to test credentials');
              }
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Test Credentials
          </button>

          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/messages/phone/test-send', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    phoneNumber: "0947006369",
                    content: "Test message from legal aid system"
                  })
                });
                const result = await response.json();
                console.log('Test SMS result:', result);
                if (result.success) {
                  alert('Test SMS sent successfully!');
                } else {
                  alert('Failed to send test SMS: ' + result.error);
                }
              } catch (error) {
                console.error('Test failed:', error);
                alert('Failed to send test SMS');
              }
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg"
          >
            Send Test SMS
          </button>
        </div>
      </div>
    </div>
  );
}