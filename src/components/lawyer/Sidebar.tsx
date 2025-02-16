"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home, Briefcase, Calendar, FileText, MessageSquare, 
  Clock, DollarSign, BookOpen, Scale, User, Settings,
  ChevronDown
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/lawyer/dashboard',
    dataTour: 'welcome'
  },
  {
    title: 'Cases',
    icon: Briefcase,
    path: '/lawyer/cases',
    dataTour: 'cases',
    subItems: [
      { title: 'Active Cases', path: '/lawyer/cases/active' },
      { title: 'Pending Cases', path: '/lawyer/cases/pending' },
      { title: 'Completed Cases', path: '/lawyer/cases/completed' },
      { title: 'Appeals', path: '/lawyer/cases/appeals' }
    ]
  },
  {
    title: 'Calendar',
    icon: Calendar,
    path: '/lawyer/calendar',
    dataTour: 'calendar'
  },
  {
    title: 'Documents',
    icon: FileText,
    path: '/lawyer/documents',
    dataTour: 'documents',
    subItems: [
      { title: 'Case Documents', path: '/lawyer/documents/cases' },
      { title: 'Legal Templates', path: '/lawyer/documents/templates' },
      { title: 'Upload Documents', path: '/lawyer/documents/upload' }
    ]
  },
  {
    title: 'Client Communications',
    icon: MessageSquare,
    path: '/lawyer/communications',
    dataTour: 'communications',
    subItems: [
      { title: 'Messages', path: '/lawyer/communications/messages' },
      { title: 'Appointments', path: '/lawyer/communications/appointments' },
      { title: 'Client Portal', path: '/lawyer/communications/portal' }
    ]
  },
  {
    title: 'Time Tracking',
    icon: Clock,
    path: '/lawyer/time-tracking',
    dataTour: 'time-tracking'
  },
  {
    title: 'Billing',
    icon: DollarSign,
    path: '/lawyer/billing',
    dataTour: 'billing',
    subItems: [
      { title: 'Time Sheets', path: '/lawyer/billing/timesheets' },
      { title: 'Invoices', path: '/lawyer/billing/invoices' },
      { title: 'Expenses', path: '/lawyer/billing/expenses' }
    ]
  },
  {
    title: 'Legal Research',
    icon: BookOpen,
    path: '/lawyer/research',
    dataTour: 'research',
    subItems: [
      { title: 'Case Law', path: '/lawyer/research/case-law' },
      { title: 'Legal Resources', path: '/lawyer/research/resources' },
      { title: 'Document Analysis', path: '/lawyer/research/analysis' }
    ]
  },
  {
    title: 'Compliance',
    icon: Scale,
    path: '/lawyer/compliance',
    dataTour: 'compliance',
    subItems: [
      { title: 'Ethics Guidelines', path: '/lawyer/compliance/ethics' },
      { title: 'Reporting', path: '/lawyer/compliance/reporting' },
      { title: 'Audit Logs', path: '/lawyer/compliance/audit' }
    ]
  },
  {
    title: 'Profile',
    icon: User,
    path: '/lawyer/profile',
    dataTour: 'profile'
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/lawyer/settings',
    dataTour: 'settings'
  }
];

export default function LawyerSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isMenuActive = (item: any) => {
    if (pathname === item.path) return true;
    if (item.subItems?.some((subItem: any) => pathname === subItem.path)) return true;
    return false;
  };

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md",
                      isMenuActive(item) 
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openMenus.includes(item.title) ? "transform rotate-180" : ""
                      )} 
                    />
                  </button>
                  {openMenus.includes(item.title) && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            href={subItem.path}
                            className={cn(
                              "block p-2 rounded-md text-sm",
                              isActive(subItem.path)
                                ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                            data-tour={item.dataTour}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center p-2 rounded-md",
                    isActive(item.path)
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  data-tour={item.dataTour}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}