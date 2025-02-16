"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineOfficeBuilding,
  HiOutlineChevronDown
} from 'react-icons/hi';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: { name: string; href: string }[];
}

interface SidebarProps {
  isOpen: boolean;
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/kebele-manager/dashboard', 
    icon: HiOutlineHome 
  },
  { 
    name: 'Case Management', 
    href: '/kebele-manager/cases', 
    icon: HiOutlineDocumentText,
    subItems: [
      { name: 'Pending Approvals', href: '/kebele-manager/cases' },
      { name: 'Approved Cases', href: '/kebele-manager/cases/approved' },
      { name: 'Rejected Cases', href: '/kebele-manager/cases/rejected' }
    ]
  },
  { 
    name: 'Resident Directory', 
    href: '/kebele-manager/residents', 
    icon: HiOutlineUsers 
  },
  { 
    name: 'Statistics', 
    href: '/kebele-manager/statistics', 
    icon: HiOutlineChartBar 
  },
  { 
    name: 'Settings', 
    href: '/kebele-manager/settings', 
    icon: HiOutlineCog 
  }
];

export default function KebeleManagerSidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [managerName, setManagerName] = useState('');
  const [kebeleName, setKebeleName] = useState('');

  useEffect(() => {
    setManagerName(localStorage.getItem('managerName') || '');
    setKebeleName(localStorage.getItem('kebeleName') || '');
  }, []);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('managerId');
    localStorage.removeItem('kebeleId');
    localStorage.removeItem('managerName');
    localStorage.removeItem('kebeleName');
    
    // Redirect to login page
    window.location.href = '/kebele-manager/login';
  };

  const isActive = (href: string) => pathname === href;
  const isExpanded = (name: string) => expanded === name;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg">
            <HiOutlineOfficeBuilding className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              {managerName}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {kebeleName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              // Menu item with dropdown
              <div>
                <button
                  onClick={() => setExpanded(isExpanded(item.name) ? null : item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md
                    ${isActive(item.href) 
                      ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-500' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </div>
                  <HiOutlineChevronDown 
                    className={`h-4 w-4 transition-transform ${isExpanded(item.name) ? 'rotate-180' : ''}`} 
                  />
                </button>
                {isExpanded(item.name) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-8 mt-1 space-y-1"
                  >
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`block px-3 py-2 text-sm rounded-md
                          ${isActive(subItem.href)
                            ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-500'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              // Regular menu item
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-md
                  ${isActive(item.href)
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 
            hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
        >
          <HiOutlineLogout className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
} 