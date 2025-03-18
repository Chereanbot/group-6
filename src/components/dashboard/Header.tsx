"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { 
  FaSun, FaMoon, FaBell, FaGlobe, FaUser,
  FaSignOutAlt, FaBars, FaTimes, FaHome,
  FaFolder, FaCalendarAlt, FaFileAlt,
  FaEnvelope, FaCog, FaQuestionCircle, FaTrash, FaExternalLinkAlt
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  href: string;
  badge?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' }
];

// Add keyframes animation for bell
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
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
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

const Header = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  
  const headerRef = useRef<HTMLElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { 
      label: t('navigation.dashboard'),
      icon: <FaHome className="w-5 h-5" />, 
      href: '/client/dashboard' 
    },
    { 
      label: t('navigation.cases'),
      icon: <FaFolder className="w-5 h-5" />, 
      href: '/client/cases' 
    },
    { 
      label: t('navigation.appointments'),
      icon: <FaCalendarAlt className="w-5 h-5" />, 
      href: '/client/appointments' 
    },
    { 
      label: t('navigation.documents'),
      icon: <FaFileAlt className="w-5 h-5" />, 
      href: '/client/documents' 
    },
    { 
      label: t('navigation.messages'),
      icon: <FaEnvelope className="w-5 h-5" />, 
      href: '/client/messages',
      badge: 2
    }
  ];

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguages(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Language handling
  const changeLanguage = (lang: typeof languages[0]) => {
    setLocale(lang.code);
    setShowLanguages(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Simulating user data fetch - replace this with your actual user data fetching logic
    const fetchUserData = async () => {
      try {
        // Replace this with your actual API call
        // const response = await fetch('/api/user');
        // const userData = await response.json();
        // For now, using mock data
        setUser({
          fullName: 'John Doe',
          email: 'john.doe@example.com'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Update notification state and trigger animation
  useEffect(() => {
    if (notifications.length > previousNotificationCount) {
      setHasNewNotifications(true);
      const timer = setTimeout(() => setHasNewNotifications(false), 2000);
      return () => clearTimeout(timer);
    }
    setPreviousNotificationCount(notifications.length);
  }, [notifications.length, previousNotificationCount]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await fetch('/api/client/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch notifications');
        const { data } = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
    const pollInterval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollInterval);
  }, [router]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`/api/client/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/client/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Add delete notification functionality
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`/api/client/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to delete notification');
      
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Add style tag to head only on client side
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = bellRingAnimation;
    document.head.appendChild(styleTag);
    
    return () => {
      styleTag.remove();
    };
  }, []);

  if (!mounted) return null;

  return (
    <header 
      ref={headerRef}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
        sticky top-0 z-50 transition-transform duration-300 w-full"
    >
      <div className="px-4 flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <Link href="/dashboard" className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="font-bold text-xl hidden sm:inline">Du LAS</span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative" ref={languageRef}>
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaGlobe className="w-5 h-5" />
              <span className="sr-only">Change Language</span>
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
                      className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 
                        dark:hover:bg-gray-700 ${locale === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasNewNotifications(false);
              }}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative 
                ${hasNewNotifications ? 'animate-bell bell-ring-effect' : ''}`}
            >
              <FaBell className={`w-5 h-5 ${hasNewNotifications ? 'text-red-500' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                    border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications.title')}</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {t('notifications.markAllRead')}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2">{t('notifications.loading')}</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="mb-2">
                          <FaBell className="w-8 h-8 mx-auto text-gray-400" />
                        </div>
                        {t('notifications.noNotifications')}
                      </div>
                    ) : (
                      <>
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-200 dark:border-gray-700 
                              ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''} 
                              hover:bg-gray-50 dark:hover:bg-gray-700/50 group`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className={`p-2 rounded-full ${getNotificationIcon(notification.type)}`}>
                                <FaBell className="w-4 h-4" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium truncate pr-4">{notification.title}</h4>
                                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {notification.link && (
                                      <Link
                                        href={notification.link}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.id);
                                        }}
                                      >
                                        <FaExternalLinkAlt className="w-3.5 h-3.5 text-gray-500" />
                                      </Link>
                                    )}
                                    <button
                                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(notification.id);
                                      }}
                                    >
                                      <FaTrash className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notification.message}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </span>
                                  {!notification.read && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                      {t('notifications.new')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                          <Link
                            href="/client/notifications"
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center justify-center space-x-1"
                            onClick={() => setShowNotifications(false)}
                          >
                            <span>{t('notifications.viewAll')}</span>
                            <FaExternalLinkAlt className="w-3 h-3" />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
            <span className="sr-only">Toggle Theme</span>
          </button>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <img
                src="/avatar-placeholder.png"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                    border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-medium">{user?.fullName || 'Guest User'}</p>
                    <p className="text-sm text-gray-500">{user?.email || 'No email available'}</p>
                  </div>
                  <nav className="p-2">
                    <Link
                      href="/client/profile"
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfile(false)}
                    >
                      <FaUser className="w-5 h-5" />
                      <span>{t('profile.viewProfile')}</span>
                    </Link>
                    <Link
                      href="/client/settings"
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfile(false)}
                    >
                      <FaCog className="w-5 h-5" />
                      <span>{t('profile.settings')}</span>
                    </Link>
                    <Link
                      href="/client/help"
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfile(false)}
                    >
                      <FaQuestionCircle className="w-5 h-5" />
                      <span>{t('profile.helpSupport')}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 
                        dark:hover:bg-gray-700 text-red-600"
                    >
                      <FaSignOutAlt className="w-5 h-5" />
                      <span>{t('navigation.logout')}</span>
                    </button>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            <span className="sr-only">Toggle Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <nav className="px-4 py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 
                    dark:hover:bg-gray-700"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;