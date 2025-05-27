"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Briefcase, Calendar, FileText, MessageSquare, 
  Clock, DollarSign, User, Settings, ChevronDown,
  LogOut, Menu, X
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/lawyer/dashboard',
    dataTour: 'welcome'
  },
  {
    title: 'My Cases',
    icon: Briefcase,
    path: '/lawyer/cases',
    dataTour: 'My cases',
    subItems: [
      { title: 'Active Cases', path: '/lawyer/cases/active' },
      { title: 'Cases Progress', path: '/lawyer/cases/progress' },
      { title: 'Case Activities', path: '/lawyer/cases/case-activity' },
      { title: 'Case Appeals', path: '/lawyer/cases/appeals' },
      { title: 'Case Activities', path: '/lawyer/cases/activities' }
    ]
  },
  {
    title: 'Appointments',
    icon: Calendar,
    path: '/lawyer/appointments',
    dataTour: 'appointments'
  },
  {
    title: 'Documents',
    icon: FileText,
    path: '/lawyer/documents',
    dataTour: 'documents',
    subItems: [
      { title: 'Upload Documents', path: '/lawyer/documents/upload' }
    ]
  },
  {
    title: 'Communications',
    icon: MessageSquare,
    path: '/lawyer/communications',
    dataTour: 'communications',
    subItems: [
      { title: 'Messages', path: '/lawyer/communications/messages' },
      { title: 'Sms', path: '/lawyer/communications/sms' }
    ]
  },
  {
    title: 'Clients',
    icon: Clock,
    path: '/lawyer/clients',
    dataTour: 'clients'
  },
  {
    title: 'Time Entry',
    icon: Clock,
    path: '/lawyer/time-entry',
    dataTour: 'time-entry'
  },
  {
    title: 'Profile',
    icon: User,
    path: '/lawyer/profile',
    dataTour: 'profile'
  },
  {
    title: 'Reports',
    icon: FileText,
    path: '/lawyer/reports',
    dataTour: 'reports',
    subItems: [
      { title: 'Analytics', path: '/lawyer/reports/analytics' },
      { title: 'Case Activity', path: '/lawyer/reports/case-activity' },
      { title: 'Case Summary', path: '/lawyer/reports/case-summary' }
    ]
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
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 shadow-md"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Mobile backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
          "border-r border-gray-200 dark:border-gray-700 shadow-sm z-40 transition-all duration-300",
          isMobile ? mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-72" : isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Collapse button (desktop only) */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-6 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300",
                isCollapsed ? "rotate-90" : "-rotate-90"
              )}
            />
          </button>
        )}

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shadow-sm">
            <span className="font-bold">DU</span>
          </div>
          {!isCollapsed && (
            <span className="ml-3 font-semibold text-gray-800 dark:text-white">DULAS Lawyer</span>
          )}
        </div>

        <nav className={cn(
          "p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
          "h-[calc(100vh-8rem)]"
        )}>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.title} className="group">
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg",
                        "transition-all duration-200",
                        isMenuActive(item) 
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm"
                          : "hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-gray-700 dark:text-gray-200"
                      )}
                    >
                      <div className="flex items-center min-w-0">
                        <item.icon className={cn(
                          "flex-shrink-0 transition-colors duration-200",
                          isMenuActive(item) 
                            ? "text-primary-500 dark:text-primary-400" 
                            : "text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400",
                          isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
                        )} />
                        {!isCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <motion.div
                          animate={{ rotate: openMenus.includes(item.title) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      )}
                    </button>
                    <AnimatePresence>
                      {openMenus.includes(item.title) && !isCollapsed && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-6 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.subItems.map((subItem) => (
                            <motion.li 
                              key={subItem.path}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link
                                href={subItem.path}
                                className={cn(
                                  "block p-2 rounded-md text-sm transition-all duration-200",
                                  isActive(subItem.path)
                                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm"
                                    : "hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-gray-600 dark:text-gray-300"
                                )}
                                data-tour={item.dataTour}
                                onClick={() => isMobile && setMobileMenuOpen(false)}
                              >
                                {subItem.title}
                              </Link>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center p-2.5 rounded-lg transition-all duration-200",
                      isActive(item.path)
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm"
                        : "hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-gray-700 dark:text-gray-200"
                    )}
                    data-tour={item.dataTour}
                    onClick={() => isMobile && setMobileMenuOpen(false)}
                  >
                    <item.icon className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      isActive(item.path) 
                        ? "text-primary-500 dark:text-primary-400" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400",
                      isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section with logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <Link
            href="/logout"
            className={cn(
              "flex items-center p-2.5 rounded-lg transition-all duration-200",
              "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            <LogOut className={cn(
              "flex-shrink-0 text-red-500 dark:text-red-400",
              isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3"
            )} />
            {!isCollapsed && (
              <span className="truncate">Logout</span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}