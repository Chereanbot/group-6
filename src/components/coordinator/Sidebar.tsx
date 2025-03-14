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
  HiOutlinePhone,
  HiOutlineX
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
        title: 'All Caese', 
        path: '/coordinator/cases/lists',
        icon: HiOutlineClipboard,
        badge: 'all' 
      },

      { 
        title: 'New Legal Aid Case', 
        path: '/coordinator/cases/new',
        icon: HiOutlinePlus,
        badge: 'New'
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
        title: 'Client List',
        path: '/coordinator/clients',
        icon: HiOutlineUserGroup
      },
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
        title: 'Appointment List',
        path: '/coordinator/clients/appointment-list',
        icon: HiOutlineCalendar,
        badge: '3'
      },
      { 
        title: 'Legal Aid Requests', 
        path: '/coordinator/clients/requests',
        icon: HiOutlineClipboardList,
        badge: 'New'
      },
      {
        title: 'Appointment Settings',
        path: '/coordinator/clients/appointments/settings',
        icon: HiOutlineCog,
        badge: 'settings'
      },

    ]
  },
  {
    title: 'Document Center',
    path: '/coordinator/documents',
    icon: HiOutlineDocumentText,
    submenu: [
      { 
        title: 'Document Listas', 
        path: '/coordinator/documents/',
        icon: HiOutlinePlus
      },

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
    title: 'Kebele Management',
    path: '/coordinator/kebele',
    icon: HiOutlineOfficeBuilding,
    submenu: [
      { 
        title: 'Kebele Directory', 
        path: '/coordinator/kebele/directory',
        icon: HiOutlineCollection
      },
      { 
        title: 'Add New Kebele', 
        path: '/coordinator/kebele/new',
        icon: HiOutlinePlus
      },
      { 
        title: 'Kebele Statistics', 
        path: '/coordinator/kebele/statistics',
        icon: HiOutlineChartBar
      },
      { 
        title: 'Kebele Officials', 
        path: '/coordinator/kebele/officials',
        icon: HiOutlineUserGroup
      }
    ]
  },
  {
    title: 'Reports',
    path: '/coordinator/reports',
    icon: HiOutlineChartBar,
    submenu: [
      {
        title: 'Reports',
        path: '/coordinator/reports',
        icon: HiOutlineChartBar
      },
      { 
        title: 'Reports Generator', 
        path: '/coordinator/reports/generator',
        icon: HiOutlineChartBar
      },
      { 
        title: 'Client Statistics', 
        path: '/coordinator/reports/client-statistics',
        icon: HiOutlineUserGroup
      },
      { 
        title: 'Performance Metrics', 
        path: '/coordinator/reports/performance',
        icon: HiOutlineClipboardList
      },
      { 
        title: 'Monthly Reports', 
        path: '/coordinator/reports/monthly',
        icon: HiOutlineDocumentText
      },
      { 
        title: 'Custom Reports', 
        path: '/coordinator/reports/custom',
        icon: HiOutlineTemplate
      },
      {
        title: 'Export Reports',
        path: '/coordinator/reports/export',
        icon: HiOutlineDocumentAdd
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
        title: 'Sms', 
        path: '/coordinator/communications/sms',
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

interface CoordinatorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoordinatorSidebar({ isOpen, onClose }: CoordinatorSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <HiOutlineX className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.title}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => toggleSubmenu(item.title)}
                          className={`w-full flex items-center justify-between p-2 rounded-md ${
                            isActive(item.path)
                              ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.title}</span>
                          </div>
                          <HiOutlineChevronDown
                            className={`h-5 w-5 transform transition-transform ${
                              isSubmenuOpen(item.title) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isSubmenuOpen(item.title) && (
                          <div className="ml-8 mt-2 space-y-1">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.title}
                                href={subItem.path}
                                className={`flex items-center p-2 rounded-md ${
                                  isActive(subItem.path)
                                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <subItem.icon className="h-5 w-5 mr-3" />
                                <span>{subItem.title}</span>
                                {subItem.badge && (
                                  <span className="ml-auto px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className={`flex items-center p-2 rounded-md ${
                          isActive(item.path)
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 