"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaSun, FaMoon, FaBell, FaGlobe, FaUser,
  FaSignOutAlt, FaCog, FaSearch, FaQuestionCircle,
  FaRegCalendarAlt, FaHeadset, FaTimes, FaBars,
  FaHome, FaFolder, FaClipboardList, FaUserFriends,
  FaFileAlt, FaChartBar, FaEnvelope
} from 'react-icons/fa';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  href: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { 
    label: 'Dashboard', 
    icon: <FaHome className="w-5 h-5" />, 
    href: '/client/dashboard' 
  },
  { 
    label: 'Cases', 
    icon: <FaFolder className="w-5 h-5" />, 
    href: '/client/cases', 
    badge: 3 
  },
  { 
    label: 'Appointments', 
    icon: <FaRegCalendarAlt className="w-5 h-5" />, 
    href: '/client/appointments' 
  },
  { 
    label: 'Documents', 
    icon: <FaFileAlt className="w-5 h-5" />, 
    href: '/client/documents' 
  },
  { 
    label: 'Messages', 
    icon: <FaEnvelope className="w-5 h-5" />, 
    href: '/client/messages',
    badge: 2 
  }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'or', name: 'Oromiffa', flag: '🇪🇹' }
];

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
}

const Header = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  
  const headerRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguages(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll behavior
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (headerRef.current) {
        if (currentScroll > lastScroll && currentScroll > 100) {
          headerRef.current.style.transform = 'translateY(-100%)';
        } else {
          headerRef.current.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSearchResults([
          { type: 'case', title: 'Case #123', url: '/cases/123' },
          { type: 'document', title: 'Contract.pdf', url: '/documents/456' },
          { type: 'client', title: 'John Doe', url: '/clients/789' }
        ]);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Language handling
  const changeLanguage = (lang: typeof languages[0]) => {
    setCurrentLanguage(lang);
    // Implement language change logic here
    setShowLanguages(false);
  };

  // Notification handling
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
    setShowNotifications(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // User menu handling
  const handleLogout = async () => {
    try {
      // Implement logout logic here
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  // Mobile menu animations
  const menuVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  // Add useEffect to handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header 
      ref={headerRef}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
        sticky top-0 z-50 transition-transform duration-300 w-full"
    >
      {/* Main Header Content */}
      <div className="px-4 flex flex-col md:flex-row md:items-center md:h-16">
        {/* Top Section */}
        <div className="flex items-center justify-between h-16 md:h-auto">
          {/* Logo and Brand */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-bold text-xl hidden sm:inline">DulaCMS</span>
          </Link>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2"
            >
              {showMobileMenu ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Desktop Navigation and Actions */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          {/* Navigation Menu */}
          <nav className="flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  text-gray-700 dark:text-gray-300 relative"
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white
                    text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <motion.div
                initial={false}
                animate={{ width: showSearch ? '300px' : '40px' }}
                className="relative"
              >
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  className={`w-full px-4 py-2 pl-10 rounded-lg bg-gray-100 dark:bg-gray-700
                    focus:ring-2 focus:ring-primary-500 transition-all duration-200
                    ${showSearch ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </motion.div>

              {/* Search Results */}
              <AnimatePresence>
                {showSearch && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800
                      rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-6 h-6 border-2 border-primary-500
                            border-t-transparent rounded-full"
                        />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result, index) => (
                          <Link
                            key={index}
                            href={result.url}
                            className="flex items-center px-4 py-2 hover:bg-gray-100
                              dark:hover:bg-gray-700"
                          >
                            <span className="capitalize text-sm text-gray-500 dark:text-gray-400 w-20">
                              {result.type}:
                            </span>
                            <span className="ml-2">{result.title}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No results found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <FaSun className="w-5 h-5" />
              ) : (
                <FaMoon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Language Selector */}
            <div ref={languageRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLanguages(!showLanguages)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  flex items-center space-x-2"
              >
                <span>{currentLanguage.flag}</span>
                <FaGlobe className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showLanguages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800
                      rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang)}
                        className="w-full text-left px-4 py-2 flex items-center space-x-3
                          hover:bg-gray-100 dark:hover:bg-gray-700"
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
            <div ref={notificationsRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <FaBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white
                      text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800
                      rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700
                      flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-primary-500 hover:text-primary-600"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-gray-200 dark:border-gray-700
                            cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50
                            ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className={`p-2 rounded-full ${getNotificationIcon(notification.type)}`}>
                              <FaBell className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="font-medium">{notification.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <img
                  src="/avatar-placeholder.png"
                  alt="User"
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden md:inline font-medium">John Doe</span>
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800
                      rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        john.doe@example.com
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2
                          hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FaUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-4 py-2
                          hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FaCog className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2
                          hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-white dark:bg-gray-800 z-50 md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700
                flex justify-between items-center">
                <Link href="/dashboard" className="flex items-center space-x-3">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                  <span className="font-bold text-xl">DulaCMS</span>
                </Link>
                <button onClick={() => setShowMobileMenu(false)}>
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg
                      hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs
                        rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg
                      hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {theme === 'dark' ? (
                      <>
                        <FaSun className="w-5 h-5" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <FaMoon className="w-5 h-5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;