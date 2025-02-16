"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenuAlt2,
  HiX,
  HiCheck,
  HiOutlineTrash,
  HiOutlineChatAlt2,
  HiOutlineInbox,
  HiOutlinePaperAirplane,
  HiOutlineArchive
} from 'react-icons/hi';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

// Helper function for date formatting
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else {
    return `${days} days ago`;
  }
};

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMessagesMenu, setShowMessagesMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    router.push('/login');
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? (
            <HiX className="w-6 h-6" />
          ) : (
            <HiOutlineMenuAlt2 className="w-6 h-6" />
          )}
        </button>

        {/* Search */}
        <div className="hidden md:block flex-1 max-w-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 
              text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <HiOutlineSun className="w-6 h-6" />
            ) : (
              <HiOutlineMoon className="w-6 h-6" />
            )}
          </button>

          {/* Messages */}
          <div className="relative">
            <button
              onClick={() => setShowMessagesMenu(!showMessagesMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Messages"
            >
              <HiOutlineChatAlt2 className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            <AnimatePresence>
              {showMessagesMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">Messages</h3>
                      <Link href="/admin/messages" className="text-sm text-primary-500 hover:text-primary-600">
                        View All
                      </Link>
                    </div>
                    <div className="space-y-4">
                      <Link href="/admin/messages/lawyer" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <HiOutlineInbox className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Lawyer Messages</p>
                          <p className="text-sm text-gray-500">View received messages</p>
                        </div>
                      </Link>
                      <Link href="/admin/messages/client" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <HiOutlinePaperAirplane className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">Client Messages</p>
                          <p className="text-sm text-gray-500">View sent messages</p>
                        </div>
                      </Link>
                      <Link href="/admin/messages/coordinator" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <HiOutlineArchive className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Coordinator Messages</p>
                          <p className="text-sm text-gray-500">View archived messages</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg 
                hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Avatar 
                name={user?.name || 'Admin'} 
                src={user?.avatar}
                size="sm"
              />
              <span className="font-medium hidden md:block">
                {user?.name || 'Administrator'}
              </span>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HiOutlineUser className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <HiOutlineCog className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20"
                    >
                      <HiOutlineLogout className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;