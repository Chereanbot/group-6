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
  FaEnvelope, FaCog, FaQuestionCircle
} from 'react-icons/fa';

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
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' }
];

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
          <span className="font-bold text-xl hidden sm:inline">DulaCMS</span>
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
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                    border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold">{t('notifications.title')}</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {t('notifications.noNotifications')}
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-200 dark:border-gray-700 
                            ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className={`p-2 rounded-full ${getNotificationIcon(notification.type)}`}>
                              <FaBell className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="font-medium">{t(`notifications.${notification.title}`)}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                              <span className="text-xs text-gray-500">{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
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
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-500">john.doe@example.com</p>
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