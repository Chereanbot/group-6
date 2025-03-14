"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  LogOut, 
  Calendar, 
  Users, 
  FileText,
  Sun,
  Moon,
  Grid,
  Briefcase,
  FolderOpen,
  Settings,
  Building2,
  Database,
  Shield,
  HelpCircle,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  AlertCircle,
  UserPlus,
  Building,
  FileCheck,
  FileEdit,
  Key,
  Inbox,
  Send,
  Archive
} from 'lucide-react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type Notification = {
  id: string;
  title: string;
  message: string;
  status: 'READ' | 'UNREAD';
  createdAt: string;
  type: string;
  case?: {
    id: string;
    title: string;
  };
};

type Message = {
  id: string;
  content: string;
  status: 'SENT' | 'READ' | 'DELIVERED';
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
    userRole: string;
    isOnline: boolean;
  };
};

interface AdminHeaderProps {
  user?: {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
  } | null;
  onMenuToggle: () => void;
}

export default function AdminHeader({ user, onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const queryClient = useQueryClient();
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread'>('all');

  // Role check effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
  }, [router]);

  // Fetch notifications
  const { data: notificationsData = { data: [] } } = useQuery<{ data: Notification[] }>({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/header/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Fetch messages
  const { data: messagesData = { data: [] } } = useQuery<{ data: Message[] }>({
    queryKey: ['admin-messages', messageFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/header/messages?filter=${messageFilter}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const notifications = notificationsData.data;
  const messages = messagesData.data;

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/admin/header/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Notification deleted');
    }
  });

  // Mark message as read mutation
  const markMessageReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch('/api/admin/header/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    }
  });

  // Mark all messages as read mutation
  const markAllMessagesReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/header/messages', {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark all messages as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('All messages marked as read');
    }
  });

  // Mark all notifications as read mutation
  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/header/notifications', {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.case) {
      router.push(`/admin/cases/${notification.case.id}`);
    }
    setShowNotifications(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SYSTEM_UPDATE':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'USER_REGISTRATION':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'OFFICE_CREATION':
        return <Building className="h-5 w-5 text-purple-500" />;
      case 'CASE_ASSIGNMENT':
        return <FileCheck className="h-5 w-5 text-orange-500" />;
      case 'DOCUMENT_UPLOAD':
        return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'TEMPLATE_UPDATE':
        return <FileEdit className="h-5 w-5 text-yellow-500" />;
      case 'PERMISSION_CHANGE':
        return <Key className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const quickAccessItems = [
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: Building2, label: 'Offices', href: '/admin/offices' },
    { icon: Shield, label: 'Permissions', href: '/admin/permissions' },
    { icon: Database, label: 'System', href: '/admin/system' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: HelpCircle, label: 'Support', href: '/admin/support' },
  ];

  const handleMessageClick = (message: Message) => {
    if (message.status === 'SENT') {
      markMessageReadMutation.mutate(message.id);
    }
    router.push(`/admin/messages/${message.id}`);
    setShowMessages(false);
  };

  const unreadMessagesCount = messages.filter(m => m.status === 'SENT').length;
  const unreadNotificationsCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <header className="sticky top-0 z-50 bg-[#1A1C1E] text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left section - Search */}
        <div className="flex items-center flex-1 max-w-md">
          <button
            onClick={onMenuToggle}
            className="mr-4 p-2 hover:bg-[#2A2C2E] rounded-lg transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-[#2A2C2E] rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-300 placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right section - Actions and Profile */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-[#2A2C2E] rounded-lg transition-colors duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {/* Messages Dropdown */}
          <DropdownMenu open={showMessages} onOpenChange={setShowMessages}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-[#2A2C2E] rounded-lg transition-colors duration-200">
                <MessageSquare className="h-5 w-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full text-xs flex items-center justify-center">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#2A2C2E] border-gray-700 mt-2">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Messages</h3>
                  <div className="flex items-center space-x-2">
                    <DropdownMenuRadioGroup value={messageFilter} onValueChange={(value: 'all' | 'unread') => setMessageFilter(value)}>
                      <div className="flex space-x-2">
                        <DropdownMenuRadioItem value="all" className="text-xs bg-[#3A3C3E] rounded px-2 py-1">
                          All
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="unread" className="text-xs bg-[#3A3C3E] rounded px-2 py-1">
                          Unread
                        </DropdownMenuRadioItem>
                      </div>
                    </DropdownMenuRadioGroup>
                    {unreadMessagesCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllMessagesReadMutation.mutate()}
                        disabled={markAllMessagesReadMutation.isPending}
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={`flex items-start space-x-3 p-3 hover:bg-[#3A3C3E] rounded-lg transition-colors duration-200 cursor-pointer
                          ${message.status === 'SENT' ? 'bg-opacity-10 bg-primary-500' : ''}`}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {message.sender.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {message.sender.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-[#2A2C2E]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{message.sender.fullName}</h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-sm line-clamp-2 ${message.status === 'READ' ? 'text-gray-400' : 'text-white'}`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No messages found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push('/admin/messages');
                      setShowMessages(false);
                    }}
                  >
                    View All Messages
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Dropdown */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-[#2A2C2E] rounded-lg transition-colors duration-200">
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#2A2C2E] border-gray-700 mt-2">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllNotificationsReadMutation.mutate()}
                      disabled={markAllNotificationsReadMutation.isPending}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-3 p-3 hover:bg-[#3A3C3E] rounded-lg transition-colors duration-200 cursor-pointer
                          ${notification.status === 'UNREAD' ? 'bg-opacity-10 bg-primary-500' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{notification.title}</h4>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-sm line-clamp-2 ${notification.status === 'READ' ? 'text-gray-400' : 'text-white'}`}>
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationMutation.mutate(notification.id);
                          }}
                          className="p-1 hover:bg-[#4A4C4E] rounded transition-colors duration-200"
                          disabled={deleteNotificationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No notifications found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 bg-[#2A2C2E] rounded-lg px-3 py-2">
                <div className="relative">
                  <Image
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.fullName || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-[#1A1C1E]" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{user?.fullName || 'Admin User'}</div>
                  <div className="text-xs text-gray-400">Super Admin</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#2A2C2E] border-gray-700">
              <div className="p-2">
                <DropdownMenuItem className="hover:bg-[#3A3C3E]">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#3A3C3E]">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-[#3A3C3E] text-red-400" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}