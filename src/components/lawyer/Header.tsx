"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, Search, User, Settings, LogOut, 
  Menu, X, Moon, Sun, MessageSquare 
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRoleEnum } from '@prisma/client';

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

interface LawyerHeaderProps {
  user: User;
}

export default function LawyerHeader({ user }: LawyerHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <input
              data-tour="header-search"
              type="text"
              placeholder="Search cases, documents, clients..."
              className="w-full px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            data-tour="header-theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-tour="header-notifications"
              className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bell />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <h3 className="font-semibold">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    // Render notifications here
                    <div key={notification.id}>
                      {/* Notification content */}
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages - New Addition */}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-tour="header-messages"
              className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MessageSquare />
              <span className={`absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-500 ${messages.length > 0 ? 'block' : 'hidden'}`} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2">
                <h3 className="font-semibold">Messages</h3>
                <p className="text-sm text-gray-500 p-2">No new messages</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              data-tour="header-profile"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <User />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/lawyer/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/lawyer/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 