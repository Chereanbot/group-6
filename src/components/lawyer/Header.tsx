"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, Settings, LogOut, 
  Menu, X, Moon, Sun, MessageSquare,
  Bell, Globe, HelpCircle, Folder
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, Eye, EyeOff, Filter } from 'lucide-react';
import { UserRoleEnum } from '@prisma/client';
import { useNotifications } from '@/contexts/NotificationContext';


// Add bell animation styles
const bellRingAnimation = `
@keyframes bellRing {
  0% { transform: rotate(0); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-15deg); }
  60% { transform: rotate(7deg); }
  80% { transform: rotate(-7deg); }
  100% { transform: rotate(0); }
}

.animate-bell {
  animation: bellRing 1s ease-in-out;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

.bell-ring-effect::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.5);
  animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
`;

// Add style tag
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = bellRingAnimation;
  document.head.appendChild(styleTag);
}

type User = {
  id: string;
  email: string;
  userRole: UserRoleEnum;
  fullName: string;
  lawyerProfile: {
    office: {
      id: string;
      name: string;
      location: string;
      address: string | null;
      contactEmail: string | null;
      contactPhone: string | null;
    } | null;
  } | null;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
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
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
  };
  recipient: {
    id: string;
    fullName: string;
    email: string;
  };
};

interface LawyerHeaderProps {
  user: User;
  office: {
    id: string;
    name: string;
    location: string;
    address: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' }
];

export default function LawyerHeader({ user, office }: LawyerHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [locale, setLocale] = useState('en');
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const { notifications, unreadCount } = useNotifications();

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  // Refs for dropdowns
  const languageRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Add these states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const queryClient = useQueryClient();

  // Add these queries
  const { data: notificationsData = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/lawyer/header/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const { data: messagesData = [] } = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await fetch('/api/lawyer/header/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Add delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/lawyer/header/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update notification state and trigger animation
  useEffect(() => {
    if (notificationsData?.length > previousNotificationCount) {
      setHasNewNotifications(true);
      const timer = setTimeout(() => setHasNewNotifications(false), 2000);
      return () => clearTimeout(timer);
    }
    setPreviousNotificationCount(notificationsData?.length || 0);
  }, [notificationsData?.length, previousNotificationCount]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const changeLanguage = (lang: typeof languages[0]) => {
    setLocale(lang.code);
    setShowLanguages(false);
  };

  // Add these handlers
  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.case) {
      router.push(`/lawyer/cases/${notification.case.id}`);
    }
  };

  const handleMessageClick = (message: Message) => {
    router.push(`/lawyer/communications/messages/${message.sender.id}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left Section - Logo and Mobile Menu */}
        <div className="flex items-center">
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center space-x-3 ml-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl hidden sm:inline dark:text-white">
              {office.name}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl mx-4" ref={searchRef}>
          <div className="relative w-full">
            <input
              data-tour="header-search"
              type="text"
              placeholder="Search cases, documents, clients..."
              className="w-full px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 dark:border-gray-600 
                bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative" ref={languageRef}>
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Globe className="h-5 w-5" />
            </button>

            <AnimatePresence>
              {showLanguages && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                    border border-gray-200 dark:border-gray-700 py-2"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang)}
                      className={`w-full px-4 py-2 text-left flex items-center space-x-3 
                        hover:bg-gray-100 dark:hover:bg-gray-700
                        ${locale === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <span>{lang.flag}</span>
                      <span className="dark:text-white">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            data-tour="header-theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700 dark:text-slate-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative ${hasNewNotifications ? 'animate-bell bell-ring-effect' : ''}`}
                >
                  <Bell className={`h-5 w-5 ${hasNewNotifications ? 'text-red-500' : ''}`} />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        // Mark all as read
                        queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
                          old.map(n => ({ ...n, isRead: true }))
                        );
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        // Delete all notifications
                        queryClient.setQueryData(['notifications'], []);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="flex items-center px-2 py-1.5">
                  <Filter className="h-4 w-4 mr-2" />
                  <DropdownMenuRadioGroup value="all" className="flex space-x-2">
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unread">Unread</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="read">Read</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {notificationsData.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    notificationsData.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                          ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => handleNotificationClick(notification)}>
                            <p className="font-medium dark:text-white">{notification.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                // Toggle read status
                                queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
                                  old.map(n => n.id === notification.id ? { ...n, isRead: !n.isRead } : n)
                                );
                              }}
                            >
                              {notification.isRead ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center" onClick={() => router.push('/lawyer/notifications')}>
                  View All Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages */}
          <div className="relative">
            <DropdownMenu open={showMessages} onOpenChange={setShowMessages}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                  {messagesData.filter(m => !m.isRead).length > 0 && (
                    <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                      {messagesData.filter(m => !m.isRead).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel>Messages</DropdownMenuLabel>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        // Mark all as read
                        queryClient.setQueryData(['messages'], (old: Message[] = []) =>
                          old.map(m => ({ ...m, isRead: true }))
                        );
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="flex items-center px-2 py-1.5">
                  <Filter className="h-4 w-4 mr-2" />
                  <DropdownMenuRadioGroup value="all" className="flex space-x-2">
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unread">Unread</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="read">Read</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </div>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {messagesData.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No messages
                    </div>
                  ) : (
                    messagesData.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                          ${!message.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {message.sender.fullName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium dark:text-white">
                                  {message.sender.id === user.id ? 'You' : message.sender.fullName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                  {message.content}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                          {!message.isRead && (
                            <Badge variant="default" className="ml-2">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center" onClick={() => router.push('/lawyer/communications/messages')}>
                  View All Messages
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-tour="header-profile"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <img
                src="/avatar-placeholder.png"
                alt="Profile"
                className="h-8 w-8 rounded-full"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="font-medium dark:text-white">{user.fullName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <div className="p-2">
                <DropdownMenuItem onClick={() => router.push('/lawyer/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/lawyer/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/lawyer/help')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <nav className="px-4 py-2 space-y-2">
              <a href="/lawyer/dashboard" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Folder className="h-5 w-5" />
                <span className="dark:text-white">Dashboard</span>
              </a>
              {/* Add more mobile menu items as needed */}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 