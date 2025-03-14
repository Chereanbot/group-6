"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
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
  HiOutlinePlus,
  HiOutlinePhotograph,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineArchive,
  HiOutlineTrash,
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineReply,
  HiOutlineShare,
  HiOutlineDuplicate,
  HiOutlinePencil,
  HiOutlineBookmark,
  HiOutlineExclamation,
  HiOutlineDownload
} from 'react-icons/hi';
import { format } from 'date-fns';
import UserList from './UserList';
import { CommunicationUser, Chat, Message } from './types';
import { toast } from 'react-hot-toast';

// Add Cloudinary configuration
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

// Add type definition for Cloudinary response after the imports
interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
}

// Add MessageAttachment interface after CloudinaryResponse
interface MessageAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
  publicId: string;
  resourceType: string;
  format: string;
}

// Add polling interval constant at the top
const POLLING_INTERVAL = 3000; // 3 seconds

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<'all' | 'admins' | 'lawyers' | 'kebele_managers'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<CommunicationUser[]>([]);
  const [lawyers, setLawyers] = useState<CommunicationUser[]>([]);
  const [kebeleManagers, setKebeleManagers] = useState<CommunicationUser[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'none' | 'image' | 'file'>('none');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedMessageForForward, setSelectedMessageForForward] = useState<Message | null>(null);
  const [filePreview, setFilePreview] = useState<{
    file: File | null;
    previewUrl: string | null;
    type: 'image' | 'file' | null;
  }>({ file: null, previewUrl: null, type: null });
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch users and chats on component mount
  useEffect(() => {
    let isSubscribed = true;
    let timeoutId: NodeJS.Timeout;

    const fetchUsersAndChats = async () => {
      if (!isSubscribed) return;

      try {
        setLoading(true);
        
        // Fetch current user info first
        const userResponse = await fetch('/api/auth/session');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (isSubscribed) setCurrentUserId(userData?.user?.id);
        } else {
          // Try getting user from cookie token
          const response = await fetch('/api/auth/verify');
          if (response.ok) {
            const data = await response.json();
            if (data.isAuthenticated && data.user && isSubscribed) {
              setCurrentUserId(data.user.id);
            }
          }
        }

        // Fetch users by role
        const usersResponse = await fetch('/api/coordinator/communications/users');
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersResponse.json();
        
        // Set all users regardless of whether they have a chat or not
        if (isSubscribed) {
          setAdmins(usersData.admins || []);
          setLawyers(usersData.lawyers || []);
          setKebeleManagers(usersData.kebeleManagers || []);
        }

        // Fetch existing chats
        const chatsResponse = await fetch('/api/coordinator/communications/chats');
        if (!chatsResponse.ok) {
          throw new Error('Failed to fetch chats');
        }
        const chatsData = await chatsResponse.json();
        if (isSubscribed) {
          setChats(chatsData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        if (isSubscribed) {
          toast.error('Failed to load users and chats');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
          // Schedule next update after 30 seconds
          timeoutId = setTimeout(fetchUsersAndChats, 30000);
        }
      }
    };

    fetchUsersAndChats();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array since we want this to run only on mount

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let users: CommunicationUser[] = [];
    
    switch (filter) {
      case 'admins':
        users = admins;
        break;
      case 'lawyers':
        users = lawyers;
        break;
      case 'kebele_managers':
        users = kebeleManagers;
        break;
      default:
        users = [...admins, ...lawyers, ...kebeleManagers];
    }

    if (!searchTerm) return users;

    return users.filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.kebeleProfile?.kebeleName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filter, searchTerm, admins, lawyers, kebeleManagers]);

  const fetchMessages = async (chatId: string, isInitialLoad: boolean = false) => {
    try {
      if (!chatId) return;
      
      setLoading(true);
      const url = `/api/coordinator/communications/messages?chatId=${chatId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      const messages = Array.isArray(data) ? data : [];
      
      // Sort messages by date
      const sortedMessages = messages.sort((a: Message, b: Message) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      setMessages(sortedMessages);
      
      // Mark messages as read
      if (selectedChatData) {
        setChats(prev => prev.map(chat => 
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        ));
      }

      // Scroll to bottom on initial load or new messages
      if (isInitialLoad || messages.length > 0) {
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat, true);
    }
    return () => {
      setMessages([]); // Clear messages when chat is deselected
    };
  }, [selectedChat]);

  // Add polling effect with cleanup and proper debouncing
  useEffect(() => {
    let isSubscribed = true;
    const pollInterval = 5000; // Poll every 5 seconds
    let lastPollTime = Date.now();

    const pollMessages = async () => {
      // Check if enough time has passed since last poll
      const now = Date.now();
      if (now - lastPollTime < pollInterval) {
        return;
      }

      if (selectedChat && isSubscribed && !loading) {
        lastPollTime = now;
        await fetchMessages(selectedChat, false);
      }
    };

    const intervalId = setInterval(pollMessages, pollInterval);

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedChat, loading]);

  const handleSendMessage = async () => {
    if (!selectedChat || !message.trim()) return;

    try {
      // If there's a file to upload, handle that first
      if (filePreview.file) {
        await handleFileUpload(filePreview.file);
        return;
      }

      const response = await fetch(`/api/coordinator/communications/messages?chatId=${selectedChat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: message,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const newMessage = await response.json();
      
      // Immediately add the new message to the list
      setMessages(prev => [...prev, newMessage].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
      setMessage("");
      scrollToBottom();
      
      // Update last fetch time to avoid duplicate messages
      setLastFetchTime(new Date());
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachment = (type: 'image' | 'file') => {
    setAttachmentType(type);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          file,
          previewUrl: reader.result as string,
          type: 'image'
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview({
        file,
        previewUrl: null,
        type: 'file'
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedChat || !currentUserId || !file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const loadingToast = toast.loading('Preparing to upload file...');

      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET!);
      formData.append('api_key', API_KEY!);

      // Upload to Cloudinary with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
          toast.loading(`Uploading: ${progress}%`, { id: loadingToast });
        }
      };

      const cloudinaryPromise = new Promise<CloudinaryResponse>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
      });

      xhr.send(formData);
      const cloudinaryData = await cloudinaryPromise;

      // Update toast to show processing
      toast.loading('Processing upload...', { id: loadingToast });

      // Create message with file attachment
      const messageData = {
        content: `Sent a file: ${file.name}`,
        attachments: [{
          url: cloudinaryData.secure_url,
          name: file.name,
          type: file.type,
          size: cloudinaryData.bytes || file.size,
          publicId: cloudinaryData.public_id,
          resourceType: cloudinaryData.resource_type,
          format: cloudinaryData.format
        }]
      };

      const response = await fetch(`/api/coordinator/communications/messages?chatId=${selectedChat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message with attachment');
      }

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
      
      // Show success toast and clear preview
      toast.success('File uploaded successfully', { id: loadingToast });
      setFilePreview({ file: null, previewUrl: null, type: null });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setAttachmentType('none');
    }
  };

  const handleUserClick = async (user: CommunicationUser) => {
    try {
      setLoading(true);
      setError(null);

      // Check if chat already exists with this user
      const existingChat = chats.find(chat => 
        chat.user && chat.user.id === user.id
      );

      if (existingChat) {
        setSelectedChat(existingChat.id);
        setShowUserList(false);
        return;
      }

      // Determine participant type based on user role
      let participantType = 'USER';
      if (user.userRole === 'KEBELE_MANAGER') {
        participantType = 'KEBELE_MANAGER';
      } else if (user.userRole === 'KEBELE_MEMBER') {
        participantType = 'KEBELE_MEMBER';
      }

      const response = await fetch('/api/coordinator/communications/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create chat');
      }

      const newChat = await response.json();
      
      // Update chats list with the new chat
      setChats(prevChats => {
        // Check if chat already exists
        const chatExists = prevChats.some(chat => chat.id === newChat.id);
        if (chatExists) {
          return prevChats;
        }
        return [
          {
            id: newChat.id,
            user: newChat.user,
            unreadCount: 0,
            lastMessage: null
          },
          ...prevChats
        ];
      });

      // Select the new chat
      setSelectedChat(newChat.id);
      setShowUserList(false);

      // Fetch messages for the new chat
      await fetchMessages(newChat.id, true);
    } catch (error) {
      console.error('Error creating chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to create chat');
      toast.error(error instanceof Error ? error.message : 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/coordinator/communications/chats/${chatId}/archive`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to archive chat');
      }
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChat === chatId) setSelectedChat(null);
      toast.success('Chat archived');
    } catch (error) {
      console.error('Error archiving chat:', error);
      toast.error('Failed to archive chat');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const response = await fetch(`/api/coordinator/communications/chats/${chatId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete chat');
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChat === chatId) setSelectedChat(null);
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  // Handle right click on message
  const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setSelectedMessage(message);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle message actions
  const handleMessageAction = async (action: string, message: Message) => {
    switch (action) {
      case 'reply':
        setMessage(`Replying to: "${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}"\n`);
        break;
      case 'forward':
        setSelectedMessageForForward(message);
        setShowForwardModal(true);
        break;
      case 'copy':
        await navigator.clipboard.writeText(message.text);
        toast.success('Message copied to clipboard');
        break;
      case 'edit':
        if (message.senderId === currentUserId) {
          setMessage(message.text);
          // TODO: Implement edit mode
        }
        break;
      case 'delete':
        if (message.senderId === currentUserId) {
          try {
            const response = await fetch(`/api/coordinator/communications/messages/${message.id}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              setMessages(prev => prev.filter(m => m.id !== message.id));
              toast.success('Message deleted');
            }
          } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
          }
        }
        break;
      case 'report':
        // TODO: Implement report functionality
        toast.success('Message reported');
        break;
    }
    setContextMenuPosition(null);
  };

  // Handle forwarding message
  const handleForwardMessage = async (targetChatId: string) => {
    if (!selectedMessageForForward) return;

    try {
      const response = await fetch(`/api/coordinator/communications/messages?chatId=${targetChatId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: selectedMessageForForward.text,
          isForwarded: true,
          originalMessageId: selectedMessageForForward.id
        }),
      });

      if (response.ok) {
        toast.success('Message forwarded');
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast.error('Failed to forward message');
    }

    setShowForwardModal(false);
    setSelectedMessageForForward(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPosition(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update the message rendering to include better UI
  const renderMessage = (msg: Message) => (
    <div
      key={msg.id}
      className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"} mb-4`}
      onContextMenu={(e) => handleMessageContextMenu(e, msg)}
    >
      <div
        className={`group relative max-w-[70%] ${
          isSelectionMode ? 'cursor-pointer' : ''
        }`}
        onClick={() => {
          if (isSelectionMode) {
            toggleMessageSelection(msg.id);
          }
        }}
      >
        {isSelectionMode && (
          <div className={`absolute -left-8 top-1/2 -translate-y-1/2 
            ${selectedMessages.has(msg.id) ? 'text-primary-500' : 'text-gray-400'}`}>
            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center
              ${selectedMessages.has(msg.id) 
                ? 'border-primary-500 bg-primary-500' 
                : 'border-gray-400'
              }`}>
              {selectedMessages.has(msg.id) && (
                <HiOutlineCheck className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        )}
        <div
          className={`relative rounded-2xl px-4 py-2 shadow-sm ${
            msg.senderId === currentUserId
              ? "bg-primary-500 text-white ml-12 rounded-br-none"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white mr-12 rounded-bl-none"
          }`}
        >
          {/* Message content */}
          <div className="prose dark:prose-invert max-w-none">
            {renderMessageContent(msg)}
          </div>

          {/* Message metadata */}
          <div className={`flex items-center justify-end mt-1 space-x-1 text-xs 
            ${msg.senderId === currentUserId ? "text-primary-100" : "text-gray-500"}`}>
            <span className="font-medium">{format(new Date(msg.createdAt), 'p')}</span>
            {msg.senderId === currentUserId && (
              <span className="flex items-center">
                {msg.status === 'SENT' && (
                  <HiOutlineCheck className="w-3 h-3 ml-0.5" />
                )}
                {msg.status === 'DELIVERED' && (
                  <div className="flex ml-0.5">
                    <HiOutlineCheck className="w-3 h-3" />
                    <HiOutlineCheck className="w-3 h-3 -ml-1" />
                  </div>
                )}
                {msg.status === 'READ' && (
                  <div className="flex text-blue-300 ml-0.5">
                    <HiOutlineCheck className="w-3 h-3" />
                    <HiOutlineCheck className="w-3 h-3 -ml-1" />
                  </div>
                )}
              </span>
            )}
          </div>

          {/* Message actions (hover) */}
          <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity
            ${msg.senderId === currentUserId ? "-left-8" : "-right-8"}`}>
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMessageAction('reply', msg);
                }}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Reply"
              >
                <HiOutlineReply className="w-4 h-4" />
              </button>
              {msg.senderId === currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessageAction('edit', msg);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Update the message content rendering
  const renderMessageContent = (msg: Message) => {
    if (msg.attachments && msg.attachments.length > 0) {
      const attachment = msg.attachments[0];
      if (attachment.type.startsWith('image/')) {
        return (
          <div className="space-y-2">
            <div className="relative group">
              <img 
                src={attachment.url} 
                alt={attachment.name}
                className="max-w-[300px] max-h-[300px] rounded-lg object-contain cursor-pointer"
                loading="lazy"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement image preview modal
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 
                transition-opacity rounded-lg flex items-center justify-center opacity-0 
                group-hover:opacity-100">
                <HiOutlinePhotograph className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {attachment.name} ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-2 p-2 bg-white/10 dark:bg-gray-700/50 rounded-lg">
            <HiOutlinePaperClip className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-gray-500">
                {(attachment.size / 1024 / 1024).toFixed(2)} MB • {attachment.type || 'Unknown type'}
              </p>
            </div>
            <a 
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-2 py-1 text-sm bg-white/20 hover:bg-white/30 
                text-white rounded flex items-center space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <HiOutlineDownload className="w-4 h-4" />
              <span>Download</span>
            </a>
          </div>
        );
      }
    }
    return (
      <p className="text-sm whitespace-pre-wrap break-words">
        {msg.text}
      </p>
    );
  };

  const toggleMessageSelection = (messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  };

  const handleBulkDelete = async () => {
    if (!selectedMessages.size) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedMessages.size} messages?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedMessages).map(messageId =>
        fetch(`/api/coordinator/communications/messages/${messageId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      
      setMessages(prev => prev.filter(msg => !selectedMessages.has(msg.id)));
      setSelectedMessages(new Set());
      setIsSelectionMode(false);
      toast.success('Messages deleted successfully');
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Failed to delete messages');
    }
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(msg => msg.id)));
    }
  };

  // Add bulk actions header when in selection mode
  const renderBulkActionsHeader = () => {
    if (!isSelectionMode) return null;

    return (
      <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 
        border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setIsSelectionMode(false);
              setSelectedMessages(new Set());
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
              dark:hover:text-gray-200"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
          <span className="text-sm font-medium">
            {selectedMessages.size} selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 
              hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            {selectedMessages.size === messages.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 
              dark:text-red-400 dark:hover:bg-red-900/20 rounded-md"
          >
            Delete Selected
          </button>
        </div>
      </div>
    );
  };

  // Update the file preview component
  const renderFilePreview = () => {
    if (!filePreview.file) return null;

    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">File Preview</h4>
          <button
            onClick={() => setFilePreview({ file: null, previewUrl: null, type: null })}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <div className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 p-4">
          {filePreview.type === 'image' && filePreview.previewUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={filePreview.previewUrl}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain"
                loading="lazy"
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-700 rounded-lg p-3">
              <div className="flex-shrink-0">
                <HiOutlinePaperClip className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB • {filePreview.file.type || 'Unknown type'}
                </p>
              </div>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                <p className="text-sm">Uploading: {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-end space-x-2">
          <button
            onClick={() => setFilePreview({ file: null, previewUrl: null, type: null })}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 
              dark:text-gray-300 dark:hover:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => filePreview.file && handleFileUpload(filePreview.file)}
            disabled={isUploading}
            className={`px-4 py-1.5 text-sm rounded-md flex items-center ${
              isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <HiOutlinePaperAirplane className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left sidebar - Chat list */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Search and filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600
                text-gray-900 dark:text-white"
            />
            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Filter buttons */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
                ${filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('admins')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap
                ${filter === 'admins'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
            >
              <HiOutlineShieldCheck className="w-4 h-4 mr-1" />
              Admins
            </button>
            <button
              onClick={() => setFilter('lawyers')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap
                ${filter === 'lawyers'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
            >
              <HiOutlineOfficeBuilding className="w-4 h-4 mr-1" />
              Lawyers
            </button>
            <button
              onClick={() => setFilter('kebele_managers')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center whitespace-nowrap
                ${filter === 'kebele_managers'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                }`}
            >
              <HiOutlineOfficeBuilding className="w-4 h-4 mr-1" />
              Kebele Managers
            </button>
          </div>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    disabled={isCreatingChat}
                    className="w-full flex items-center p-2 hover:bg-gray-50 
                      dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 
                        to-primary-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.fullName.charAt(0)}
                        </span>
                      </div>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 
                          rounded-full border-2 border-white dark:border-gray-900" />
                      )}
                    </div>
                    <div className="ml-3 text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.userRole === 'KEBELE_MANAGER' 
                          ? `${user.kebeleProfile?.position || 'Manager'} at ${user.kebeleProfile?.kebeleName}`
                          : user.userRole.toLowerCase()} • {
                          user.isOnline ? 'Online' : 
                          user.lastSeen ? 
                            `Last seen ${format(new Date(user.lastSeen), 'p')}` : 
                            'Offline'
                        }
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Chat area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 
                  flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {selectedChatData?.user.fullName.charAt(0)}
                  </span>
                </div>
                {selectedChatData?.user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full 
                    border-2 border-white dark:border-gray-900" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                  {selectedChatData?.user.fullName}
                  {selectedChatData?.user.starred && (
                    <HiOutlineStar className="w-4 h-4 text-yellow-400 ml-1" />
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedChatData?.user.userRole.toLowerCase()} • {
                    selectedChatData?.user.isOnline ? 'Online' : 
                    selectedChatData?.user.lastSeen ? 
                      `Last seen ${format(new Date(selectedChatData.user.lastSeen), 'p')}` : 
                      'Offline'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="Voice call">
                <HiOutlinePhone className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="Video call">
                <HiOutlineVideoCamera className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="Select messages"
              >
                <HiOutlineDuplicate className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="More options">
                <HiOutlineDotsVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            {renderBulkActionsHeader()}
            {messages.map(msg => renderMessage(msg))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="Add emoji"
              >
                <HiOutlineEmojiHappy className="w-6 h-6 text-gray-500" />
              </button>
              <button
                onClick={() => handleAttachment('file')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="Attach file"
              >
                <HiOutlinePaperClip className="w-6 h-6 text-gray-500" />
              </button>
              <button
                onClick={() => handleAttachment('image')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                title="Send image"
              >
                <HiOutlinePhotograph className="w-6 h-6 text-gray-500" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setIsTyping(true);
                  // Implement typing indicator logic here
                }}
                onKeyPress={handleKeyPress}
                onBlur={() => setIsTyping(false)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                  focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600
                  text-gray-900 dark:text-white"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-2 rounded-full transition-colors duration-200
                  ${message.trim()
                    ? 'bg-primary-500 hover:bg-primary-600'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  }`}
              >
                <HiOutlinePaperAirplane className="w-6 h-6 text-white" />
              </button>
            </div>
            {isTyping && (
              <div className="text-xs text-gray-500 mt-1 ml-4">
                Typing...
              </div>
            )}
          </div>

          {/* File preview */}
          {renderFilePreview()}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept={attachmentType === 'image' ? 'image/*' : undefined}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800">
          <div className="flex-1 p-4">
            {/* Messages will appear here when a chat is selected */}
          </div>
        </div>
      )}

      {/* User list modal */}
      {showUserList && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserList(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg w-96 max-h-[80vh] overflow-hidden 
            shadow-xl transform transition-all">
            <UserList 
              onSelectUser={handleUserClick}
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

      {/* Context Menu */}
      {contextMenuPosition && selectedMessage && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg py-2 w-48"
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            transform: `translate(${
              contextMenuPosition.x + 192 > window.innerWidth ? -100 : 0
            }%, ${
              contextMenuPosition.y + 200 > window.innerHeight ? -100 : 0
            }%)`
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              handleMessageAction('reply', selectedMessage);
            }}
            className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 
              dark:hover:bg-gray-800"
          >
            <HiOutlineReply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleMessageAction('forward', selectedMessage);
            }}
            className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 
              dark:hover:bg-gray-800"
          >
            <HiOutlineShare className="w-4 h-4" />
            <span>Forward</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleMessageAction('copy', selectedMessage);
            }}
            className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 
              dark:hover:bg-gray-800"
          >
            <HiOutlineDuplicate className="w-4 h-4" />
            <span>Copy</span>
          </button>
          {selectedMessage.senderId === currentUserId && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleMessageAction('edit', selectedMessage);
                }}
                className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 
                  dark:hover:bg-gray-800"
              >
                <HiOutlinePencil className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleMessageAction('delete', selectedMessage);
                }}
                className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 
                  dark:hover:bg-gray-800 text-red-500"
              >
                <HiOutlineTrash className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
          <button
            onClick={(e) => {
              e.preventDefault();
              handleMessageAction('report', selectedMessage);
            }}
            className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100 
              dark:hover:bg-gray-800 text-yellow-500"
          >
            <HiOutlineExclamation className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>
      )}

      {/* Forward Message Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-96 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium">Forward Message</h3>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleForwardMessage(chat.id)}
                  className="w-full p-2 flex items-center space-x-3 hover:bg-gray-100 
                    dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 
                    to-primary-600 flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {chat.user.fullName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium">{chat.user.fullName}</h4>
                    <p className="text-sm text-gray-500">{chat.user.userRole}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setSelectedMessageForForward(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 
                  dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 