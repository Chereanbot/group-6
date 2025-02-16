"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineViewGrid,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineChatAlt,
  HiOutlineBell,
  HiOutlineChevronDown,
  HiOutlineOfficeBuilding,
  HiOutlinePlus,
  HiOutlineDocumentAdd,
  HiOutlineSearch,
  HiOutlineArchive,
  HiOutlineScale,
  HiOutlineLibrary,
  HiOutlineClipboard,
  HiOutlineTemplate,
  HiOutlineCollection,
  HiOutlinePhone
} from 'react-icons/hi';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/coordinator/dashboard',
    icon: HiOutlineViewGrid
  },
  {
    title: 'change layout template',
    path: '/coordinator/use-template',
    icon: HiOutlineTemplate,
    submenu: [
      {
        title: 'for all pages',
        path: '/coordinator/use-template',
        icon: HiOutlineTemplate
      },
      { 
        title: 'Case Templates', 
        path: '/coordinator/cases/use-template',
        icon: HiOutlineTemplate
      },
      {
        title: 'Document Templates',
        path: '/coordinator/documents/use-template',
        icon: HiOutlineTemplate
      },
      {
        title: 'client template',
        path: '/coordinator/clients/use-template',
        icon: HiOutlineTemplate
      }
    ]
  },
  {
    title: 'Legal Aid Cases',
    path: '/coordinator/cases',
    icon: HiOutlineScale,
    submenu: [
      { 
        title: 'New Legal Aid Case', 
        path: '/coordinator/cases/new',
        icon: HiOutlinePlus,
        badge: 'New'
      },
      //save as draft
      { 
        title: 'Draft Cases', 
        path: '/coordinator/cases/draft',
        icon: HiOutlineClipboard,
        badge: '3'
      },
      { 
        title: 'Active Cases', 
        path: '/coordinator/cases/active',
        icon: HiOutlineBriefcase,
        badge: '12'
      },
      { 
        title: 'Pending Review', 
        path: '/coordinator/cases/pending',
        icon: HiOutlineClipboard,
        badge: '5'
      },
      { 
        title: 'Case Templates', 
        path: '/coordinator/cases/templates',
        icon: HiOutlineTemplate
      },
      { 
        title: 'Archived Cases', 
        path: '/coordinator/cases/archived',
        icon: HiOutlineArchive
      }
    ]
  },
  {
    title: 'Client Management',
    path: '/coordinator/clients',
    icon: HiOutlineUserGroup,
    submenu: [
      { 
        title: 'Client Registration', 
        path: '/coordinator/clients/register',
        icon: HiOutlinePlus
      },
      { 
        title: 'Client Directory', 
        path: '/coordinator/clients/directory',
        icon: HiOutlineCollection
      },
      { 
        title: 'Appointments', 
        path: '/coordinator/clients/appointments',
        icon: HiOutlineCalendar,
        badge: '3'
      },
      { 
        title: 'Legal Aid Requests', 
        path: '/coordinator/clients/requests',
        icon: HiOutlineClipboardList,
        badge: 'New'
      }
    ]
  },
  {
    title: 'Document Center',
    path: '/coordinator/documents',
    icon: HiOutlineDocumentText,
    submenu: [
      { 
        title: 'Upload Documents', 
        path: '/coordinator/documents/upload',
        icon: HiOutlinePlus
      },
      { 
        title: 'Document Library', 
        path: '/coordinator/documents/library',
        icon: HiOutlineLibrary
      },
      { 
        title: 'Legal Templates', 
        path: '/coordinator/documents/templates',
        icon: HiOutlineDocumentAdd
      },
      { 
        title: 'Pending Review', 
        path: '/coordinator/documents/review',
        icon: HiOutlineClipboard,
        badge: '8'
      }
    ]
  },
  {
    title: 'Office Management',
    path: '/coordinator/office',
    icon: HiOutlineOfficeBuilding,
    submenu: [
      { 
        title: 'Staff Directory', 
        path: '/coordinator/office/staff',
        icon: HiOutlineUserGroup
      },
      { 
        title: 'Resources', 
        path: '/coordinator/office/resources',
        icon: HiOutlineCollection
      },
      { 
        title: 'Reports', 
        path: '/coordinator/office/reports',
        icon: HiOutlineChartBar
      }
    ]
  },
  {
    title: 'Communications',
    path: '/coordinator/communications',
    icon: HiOutlineChatAlt,
    submenu: [
      { 
        title: 'Messages', 
        path: '/coordinator/communications/messages',
        icon: HiOutlineChatAlt,
        badge: '3'
      },
      { 
        title: 'Phone Log', 
        path: '/coordinator/communications/phone-log',
        icon: HiOutlinePhone
      },
      { 
        title: 'Notifications', 
        path: '/coordinator/communications/notifications',
        icon: HiOutlineBell,
        badge: '7'
      }
    ]
  },
  {
    title: 'Settings',
    path: '/coordinator/settings',
    icon: HiOutlineCog
  }
];

export default function CoordinatorSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const toggleSubmenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isSubmenuOpen = (title: string) => openMenus.includes(title);

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r 
        border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300
        backdrop-filter backdrop-blur-sm shadow-xl
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="p-6 flex justify-between items-center backdrop-blur-md bg-white/30 dark:bg-gray-800/30 sticky top-0 z-10">
        {!collapsed && (
          <div className="hover:scale-105 transition-transform duration-200">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              DulaCMS
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Legal Aid Center
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 
            transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <HiOutlineChevronDown 
            className={`w-5 h-5 transform transition-transform duration-300 
              ${collapsed ? 'rotate-90' : '-rotate-90'}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-4 pb-6">
        {menuItems.map((item) => (
          <div key={item.title} className="mb-2 group">
            {item.submenu ? (
              <div>
                <button
                  onClick={() => toggleSubmenu(item.title)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg
                    transition-all duration-200 hover:scale-[1.02] hover:shadow-md
                    ${isSubmenuOpen(item.title) 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3 group-hover:rotate-6 transition-transform duration-200" />
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </div>
                  {!collapsed && (
                    <motion.div
                      animate={{ rotate: isSubmenuOpen(item.title) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <HiOutlineChevronDown className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>

                <AnimatePresence>
                  {isSubmenuOpen(item.title) && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 mt-2 space-y-1"
                    >
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.path}
                          href={subitem.path}
                          className={`flex items-center justify-between px-4 py-2 rounded-lg 
                            text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-sm
                            ${isActive(subitem.path)
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-md'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                            {subitem.icon && <subitem.icon className="w-4 h-4 group-hover:rotate-6 transition-transform duration-200" />}
                            <span className="group-hover:text-primary-600 dark:group-hover:text-primary-400">{subitem.title}</span>
                          </div>
                          {subitem.badge && (
                            <span className="px-2 py-1 text-xs font-medium bg-primary-100/80 
                              dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full
                              shadow-inner hover:shadow-md transition-shadow duration-200">
                              {subitem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={item.path}
                className={`flex items-center justify-between px-4 py-2 rounded-lg
                  transition-all duration-200 hover:scale-[1.02] hover:shadow-md
                  ${isActive(item.path)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3 group-hover:rotate-6 transition-transform duration-200" />
                  {!collapsed && <span className="font-medium">{item.title}</span>}
                </div>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t 
          border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80
          backdrop-filter backdrop-blur-sm">
          <div className="flex items-center space-x-3 group hover:scale-[1.02] transition-transform duration-200">
            <img
              src="/default-avatar.png"
              alt="Profile"
              className="w-10 h-10 rounded-full ring-2 ring-primary-500 ring-offset-2 
                dark:ring-offset-gray-800 transition-all duration-200
                group-hover:ring-primary-400 group-hover:shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate
                group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Legal Aid Coordinator
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Yirga Chafe Office
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 