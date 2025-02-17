"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  HelpCircle
} from 'lucide-react';
import Image from 'next/image';

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  useEffect(() => {
    // Check system preference for dark mode
    if (typeof window !== 'undefined') {
      const darkModePreference = localStorage.getItem('darkMode');
      setIsDarkMode(darkModePreference === 'true');
      document.documentElement.classList.toggle('dark', darkModePreference === 'true');
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/coordinator/notifications');
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/coordinator/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const quickAccessItems = [
    { icon: Calendar, label: 'Appointments', href: '/coordinator/appointments' },
    { icon: Users, label: 'Clients', href: '/coordinator/clients/directory' },
    { icon: FileText, label: 'Cases', href: '/coordinator/cases' },
    { icon: Building2, label: 'Offices', href: '/coordinator/offices' },
    { icon: Database, label: 'Storage', href: '/coordinator/storage' },
    { icon: Shield, label: 'Security', href: '/coordinator/security' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/coordinator/dashboard" className="flex items-center space-x-3 ml-4">
              <Image
                src="/logo.png"
                alt="Legal Aid Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Legal Aid Services</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search cases, clients, or appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Quick Access Button */}
            <div className="relative">
              <button
                onClick={() => setShowQuickAccess(!showQuickAccess)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Grid className="h-6 w-6" />
              </button>

              {showQuickAccess && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 p-4">
                  {quickAccessItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <item.icon className="h-6 w-6 mb-1" />
                      <span className="text-xs text-center">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notification.timestamp}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No new notifications</div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <User className="h-6 w-6" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">coordinator@legalaid.com</p>
                  </div>
                  
                  <Link href="/coordinator/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <User className="h-4 w-4 inline-block mr-2" />
                    My Profile
                  </Link>
                  <Link href="/coordinator/offices" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Building2 className="h-4 w-4 inline-block mr-2" />
                    My Offices
                  </Link>
                  <Link href="/coordinator/clients" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Users className="h-4 w-4 inline-block mr-2" />
                    My Clients
                  </Link>
                  <Link href="/coordinator/storage" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FolderOpen className="h-4 w-4 inline-block mr-2" />
                    My Storage
                  </Link>
                  <Link href="/coordinator/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Settings className="h-4 w-4 inline-block mr-2" />
                    Settings
                  </Link>
                  <Link href="/help" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <HelpCircle className="h-4 w-4 inline-block mr-2" />
                    Help & Support
                  </Link>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search - Visible on small screens */}
      <div className="md:hidden px-4 pb-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
