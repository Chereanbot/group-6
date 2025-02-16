"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import {
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineChartBar,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlineChat,
  HiOutlineDocumentText,
  HiOutlineBadgeCheck,
  HiOutlineAcademicCap
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import type { CoordinatorStats, Notification } from '@/types/coordinator';

interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export default function CoordinatorHeader() {
  const router = useRouter();
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [coordinatorStats, setCoordinatorStats] = useState<CoordinatorStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCoordinatorData = async () => {
      if (!session?.user?.id) return;
      
      try {
        const [statsRes, notificationsRes] = await Promise.all([
          fetch('/api/coordinator/stats'),
          fetch('/api/coordinator/notifications')
        ]);

        if (statsRes.ok && notificationsRes.ok) {
          const [stats, notifs] = await Promise.all([
            statsRes.json(),
            notificationsRes.json()
          ]);

          setCoordinatorStats(stats);
          setNotifications(notifs);
        }
      } catch (error) {
        console.error('Error fetching coordinator data:', error);
        toast.error('Failed to load some data');
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinatorData();
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/coordinator/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-white dark:bg-gray-800 border-b 
      border-gray-200 dark:border-gray-700 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Search Section */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Search cases, documents, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 
                bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 
                focus:ring-primary-500"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 
              text-gray-400" />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HiOutlineBriefcase className="h-5 w-5 text-gray-500" />
            </button>

            <AnimatePresence>
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg 
                    shadow-lg border dark:border-gray-700"
                >
                  <div className="p-4 grid grid-cols-3 gap-2">
                    <QuickActionButton
                      icon={HiOutlineBriefcase}
                      label="New Case"
                      onClick={() => router.push('/coordinator/cases/new')}
                    />
                    <QuickActionButton
                      icon={HiOutlineCalendar}
                      label="Schedule"
                      onClick={() => router.push('/coordinator/calendar')}
                    />
                    <QuickActionButton
                      icon={HiOutlineDocumentText}
                      label="Documents"
                      onClick={() => router.push('/coordinator/documents')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <HiOutlineSun className="h-5 w-5 text-gray-500" />
            ) : (
              <HiOutlineMoon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            >
              <HiOutlineBell className="h-5 w-5 text-gray-500" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <NotificationsDropdown notifications={notifications} />
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 
                dark:hover:bg-gray-700"
            >
              <img
                src={session?.user?.image || "/default-avatar.png"}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {coordinatorStats?.office?.name || 'Office Coordinator'}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <ProfileDropdown
                  stats={coordinatorStats}
                  onLogout={handleLogout}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

// Helper Components
function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100 
        dark:hover:bg-gray-700 transition-colors"
    >
      <Icon className="h-6 w-6 text-gray-500 mb-1" />
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </button>
  );
}

function NotificationsDropdown({ notifications }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg 
        shadow-lg border dark:border-gray-700"
    >
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b dark:border-gray-700 last:border-0 
              ${!notification.read ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
          >
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.message}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
              {notification.time}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileDropdown({ stats, onLogout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg 
        shadow-lg border dark:border-gray-700"
    >
      {/* Stats Overview */}
      <div className="p-4 border-b dark:border-gray-700 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {stats?.casesHandled || 0}
          </div>
          <div className="text-xs text-gray-500">Cases</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {stats?.successRate || 0}%
          </div>
          <div className="text-xs text-gray-500">Success</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {stats?.activeProjects || 0}
          </div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <ProfileMenuItem
          href="/coordinator/profile"
          icon={HiOutlineUser}
          label="My Profile"
        />
        <ProfileMenuItem
          href="/coordinator/achievements"
          icon={HiOutlineBadgeCheck}
          label="Achievements"
        />
        <ProfileMenuItem
          href="/coordinator/qualifications"
          icon={HiOutlineAcademicCap}
          label="Qualifications"
        />
        <ProfileMenuItem
          href="/coordinator/office"
          icon={HiOutlineOfficeBuilding}
          label="Office Details"
        />
        <ProfileMenuItem
          href="/coordinator/performance"
          icon={HiOutlineChartBar}
          label="Performance"
        />
        <ProfileMenuItem
          href="/coordinator/settings"
          icon={HiOutlineCog}
          label="Settings"
        />

        <hr className="my-2 border-gray-200 dark:border-gray-700" />

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg 
            text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <HiOutlineLogout className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
}

function ProfileMenuItem({ href, icon: Icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 
        dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
} 