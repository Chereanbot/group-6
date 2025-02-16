"use client";

import { useState, useEffect } from 'react';
import { 
  HiOutlinePaperAirplane, 
  HiOutlineSearch, 
  HiOutlineDotsVertical, 
  HiOutlineEmojiHappy, 
  HiOutlinePaperClip,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineOfficeBuilding,
  HiOutlineFilter,
  HiOutlineStar,
  HiOutlinePlus
} from 'react-icons/hi';
import UserList from './UserList';

type User = {
  id: string;
  fullName: string;
  email: string;
  userRole: 'COORDINATOR' | 'ADMIN' | 'SUPER_ADMIN';
  isOnline: boolean;
  lastSeen: Date | null;
  coordinator?: {
    office?: {
      id: string;
      name: string;
    };
  };
  starred: boolean;
  unreadCount: number;
};

type Message = {
  id: number;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
};

type Chat = {
  id: string;
  user: User;
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  unreadCount: number;
};

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<'all' | 'coordinator' | 'admin' | 'starred'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch users and chats on component mount and when filter/search changes
  useEffect(() => {
    const fetchUsersAndChats = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          search: searchTerm,
          filter: filter,
        });
        
        const [usersResponse, chatsResponse] = await Promise.all([
          fetch(`/api/users?${queryParams.toString()}`),
          fetch(`/api/chats?${queryParams.toString()}`)
        ]);

        if (!usersResponse.ok || !chatsResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const usersData = await usersResponse.json();
        const chatsData = await chatsResponse.json();

        // Filter out users that already have chats
        const chatUserIds = new Set(chatsData.map((chat: Chat) => chat.user.id));
        const filteredUsers = usersData.filter((user: User) => !chatUserIds.has(user.id));

        setUsers(filteredUsers);
        setChats(chatsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // You could add a toast notification here
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndChats();
  }, [searchTerm, filter]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const response = await fetch(`/api/chats/${selectedChat}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectUser = async (user: User) => {
    try {
      setIsCreatingChat(true);
      const response = await fetch('/api/chats/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          participantId: user.id,
          participantRole: user.userRole 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create chat');

      const chat = await response.json();
      setSelectedChat(chat.id);
      setShowUserList(false);
      
      await fetchMessages(chat.id);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left sidebar - Chat list */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700">
        {/* Search and filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
            />
            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Filter buttons */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap
                ${filter === "all" 
                  ? "bg-primary-500 text-white" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
            >
              <HiOutlineUserGroup className="inline w-4 h-4 mr-1" />
              All
            </button>
            <button
              onClick={() => setFilter("coordinator")}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap
                ${filter === "coordinator" 
                  ? "bg-primary-500 text-white" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
            >
              <HiOutlineOfficeBuilding className="inline w-4 h-4 mr-1" />
              Coordinators
            </button>
            <button
              onClick={() => setFilter("admin")}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap
                ${filter === "admin" 
                  ? "bg-primary-500 text-white" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
            >
              <HiOutlineShieldCheck className="inline w-4 h-4 mr-1" />
              Admins
            </button>
            <button
              onClick={() => setFilter("starred")}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap
                ${filter === "starred" 
                  ? "bg-primary-500 text-white" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
            >
              <HiOutlineStar className="inline w-4 h-4 mr-1" />
              Starred
            </button>
          </div>
        </div>

        {/* Users and Chats list */}
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : users.length === 0 && chats.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No users or chats found
            </div>
          ) : (
            <>
              {/* Users without chats */}
              {users.length > 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </div>
              )}
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center p-4 cursor-pointer hover:bg-gray-50 
                    dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 
                      flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {user.fullName.charAt(0)}
                      </span>
                    </div>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                        border-2 border-white dark:border-gray-900" />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.userRole.toLowerCase()} • {user.coordinatorProfile?.office?.name || 'Head Office'}
                    </p>
                  </div>
                </div>
              ))}

              {/* Existing chats */}
              {chats.length > 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recent Chats
                </div>
              )}
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 
                    dark:hover:bg-gray-800 transition-colors duration-200
                    ${selectedChat === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 
                      flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {chat.user.fullName.charAt(0)}
                      </span>
                    </div>
                    {chat.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                        border-2 border-white dark:border-gray-900" />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {chat.user.fullName}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-sm text-gray-500">
                          {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-sm text-gray-500">
                        {chat.user.userRole.toLowerCase()} • {chat.user.coordinatorProfile?.office?.name || 'Head Office'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-primary-500 text-white text-xs rounded-full 
                          px-2 py-1 min-w-[1.25rem] text-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right side - Chat area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={selectedChatData?.user.avatar}
                alt={selectedChatData?.user.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                  {selectedChatData?.user.fullName}
                  {selectedChatData?.user.starred && (
                    <HiOutlineStar className="w-4 h-4 text-yellow-400 ml-1" />
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedChatData?.user.userRole} • {selectedChatData?.user.coordinatorProfile?.office?.name || 'Head Office'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <HiOutlineDotsVertical className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={() => setShowUserList(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <HiOutlinePlus className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.senderId === "me"
                      ? "bg-primary-500 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center mt-1 space-x-1 text-xs ${
                    msg.senderId === "me" ? "text-primary-100" : "text-gray-500"
                  }`}>
                    <span>{msg.timestamp}</span>
                    {msg.senderId === "me" && (
                      <span>
                        {msg.status === "sent" && "✓"}
                        {msg.status === "delivered" && "✓✓"}
                        {msg.status === "read" && "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <HiOutlineEmojiHappy className="w-6 h-6 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <HiOutlinePaperClip className="w-6 h-6 text-gray-500" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                  focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600
                  text-gray-900 dark:text-white"
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 bg-primary-500 hover:bg-primary-600 rounded-full 
                  transition-colors duration-200"
              >
                <HiOutlinePaperAirplane className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Placeholder when no chat is selected
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-xl">Select a chat to start messaging</p>
          </div>
        </div>
      )}

      {showUserList && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserList(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg w-96 h-[32rem] overflow-hidden 
            shadow-xl transform transition-all relative">
            <UserList 
              onSelectUser={handleSelectUser} 
              onClose={() => setShowUserList(false)}
            />
            {isCreatingChat && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 
                backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 