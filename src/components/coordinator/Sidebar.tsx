"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Briefcase,
  Users,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  ClipboardList,
  MessageSquare,
  Bell,
  ChevronDown,
  Building,
  PlusCircle,
  FileUp,
  Search,
  Archive,
  Scale,
  Library,
  Clipboard,
  FileCode,
  FolderOpen,
  Phone,
  X,
  Clock,
  Menu,
  LogOut
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/coordinator/dashboard',
    icon: LayoutGrid,
    dataTour: 'dashboard'
  },
  {
    title: 'Legal Aid Cases',
    path: '/coordinator/cases',
    icon: Scale,
    dataTour: 'cases',
    subItems: [
      { 
        title: 'All Cases', 
        path: '/coordinator/cases/lists',
        badge: 'all' 
      },
      { 
        title: 'New Cases', 
        path: '/coordinator/cases/new',
        badge: 'New'
      }
    ]
  },
  {
    title: 'Clients',
    path: '/coordinator/clients',
    icon: Users,
    dataTour: 'clients',
    subItems: [
      {
        title: 'Client List',
        path: '/coordinator/clients'
      },
      { 
        title: 'Client Registration', 
        path: '/coordinator/clients/register'
      }
    ]
  },
  {
    title: 'Appointments',
    path: '/coordinator/appointments',
    icon: Calendar,
    dataTour: 'appointments',
    subItems: [
      {
        title: 'Appointment List',
        path: '/coordinator/clients/appointment-list',
        badge: '3'
      },
      { 
        title: 'Manage Appointments', 
        path: '/coordinator/clients/appointments',
        badge: '3'
      },
      {
        title: 'Appointment Settings',
        path: '/coordinator/clients/appointments/settings'
      }
    ]
  },
  {
    title: 'Documents',
    path: '/coordinator/documents',
    icon: FileText,
    dataTour: 'documents',
    subItems: [
      { 
        title: 'Document List', 
        path: '/coordinator/documents/'
      }
    ]
  },
  {
    title: 'My Office',
    path: '/coordinator/office',
    icon: Building,
    dataTour: 'office',
    subItems: [
      { 
        title: 'Office Details', 
        path: '/coordinator/office'
      }
    ]
  },
  {
    title: 'Reports',
    path: '/coordinator/reports',
    icon: BarChart3,
    dataTour: 'reports',
    subItems: [
      {
        title: 'Dashboard',
        path: '/coordinator/reports'
      },
      { 
        title: 'Reports Generator', 
        path: '/coordinator/reports/generator'
      },
      { 
        title: 'Client Statistics', 
        path: '/coordinator/reports/client-statistics'
      },
      { 
        title: 'Performance Metrics', 
        path: '/coordinator/reports/performance'
      },
      { 
        title: 'Monthly Reports', 
        path: '/coordinator/reports/monthly'
      },
      { 
        title: 'Custom Reports', 
        path: '/coordinator/reports/custom'
      },
      {
        title: 'Export Reports',
        path: '/coordinator/reports/export'
      }
    ]
  },
  {
    title: 'Communications',
    path: '/coordinator/communications',
    icon: MessageSquare,
    dataTour: 'communications',
    subItems: [
      { 
        title: 'Messages', 
        path: '/coordinator/communications/messages',
        badge: '5'
      },
      { 
        title: 'SMS', 
        path: '/coordinator/communications/sms'
      },
      { 
        title: 'Notifications', 
        path: '/coordinator/communications/notifications',
        badge: '7'
      }
    ]
  },
  {
    title: 'Settings',
    path: '/coordinator/settings',
    icon: Settings,
    dataTour: 'settings'
  }
];

interface CoordinatorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CoordinatorSidebar({ isOpen, onClose }: CoordinatorSidebarProps = {}) {
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
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 shadow-md hover:bg-primary-200 dark:hover:bg-primary-800 active:bg-primary-300 dark:active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-600"
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
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
          "bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
          "border-r border-gray-200 dark:border-gray-700 shadow-sm",
          isMobile ? "w-[280px]" : isCollapsed ? "w-[70px]" : "w-[240px]",
          isMobile && !mobileMenuOpen && "transform -translate-x-full"
        )}
      >
        {/* Sidebar header with logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary-500 text-white font-bold text-lg">
              DU
            </div>
            {!isCollapsed && (
              <h1 className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
                DULAS Coordinator
              </h1>
            )}
          </div>
          
          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
            >
              <ChevronDown className={cn(
                "h-5 w-5 transition-transform",
                isCollapsed ? "rotate-90" : "-rotate-90"
              )} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li key={item.title} className="group">
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200",
                        isMenuActive(item)
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm ring-2 ring-primary-200 dark:ring-primary-800/30"
                          : "hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-gray-700 dark:text-gray-200 hover:shadow-sm active:bg-primary-100 dark:active:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30"
                      )}
                      data-tour={item.dataTour}
                    >
                      <div className="flex items-center">
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
                        <ChevronDown className={cn(
                          "h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200",
                          openMenus.includes(item.title) ? "rotate-180" : ""
                        )} />
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
                                  "flex items-center justify-between p-2 rounded-md text-sm transition-all duration-200",
                                  isActive(subItem.path)
                                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm ring-2 ring-primary-200 dark:ring-primary-800/30 border-l-2 border-primary-500 dark:border-primary-400"
                                    : "hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-gray-600 dark:text-gray-300 hover:border-l-2 hover:border-primary-300 dark:hover:border-primary-700 active:bg-primary-100 dark:active:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30"
                                )}
                                data-tour={item.dataTour}
                                onClick={() => isMobile && setMobileMenuOpen(false)}
                              >
                                <span>{subItem.title}</span>
                                {subItem.badge && (
                                  <span className="px-2 py-0.5 ml-2 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 animate-pulse">
                                    {subItem.badge}
                                  </span>
                                )}
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
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm ring-2 ring-primary-200 dark:ring-primary-800/30 border-l-2 border-primary-500 dark:border-primary-400"
                        : "hover:bg-primary-50/50 dark:hover:bg-primary-900/10 text-gray-700 dark:text-gray-200 hover:border-l-2 hover:border-primary-300 dark:hover:border-primary-700 active:bg-primary-100 dark:active:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800/30"
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <Link
            href="/login"
            className={cn(
              "flex items-center p-2.5 rounded-lg transition-all duration-200",
              "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 active:bg-red-100 dark:active:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800/30"
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