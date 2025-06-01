"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChartPie,
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineOfficeBuilding,
  HiOutlineCash,
  HiOutlineDocumentReport,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineUserAdd,
  HiOutlineBadgeCheck,
  HiOutlineClipboardList,
  HiOutlineDocumentDuplicate,
  HiOutlineLockClosed,
  HiOutlineExclamation,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineBriefcase,
  HiOutlineLightBulb,
  HiOutlineStar,
  HiOutlineCollection,
  HiOutlineDocument,
  HiOutlineChatAlt2,
  HiOutlineInbox,
  HiOutlinePaperAirplane,
  HiOutlineArchive,
} from 'react-icons/hi';
import { useAdmin } from '@/contexts/AdminContext';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  submenu?: {
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: HiOutlineChartPie,
    path: '/admin/dashboard'
  },
  {
    title: 'Messages',
    icon: HiOutlineChatAlt2,
    path: '/admin/messages'
  },
  {
    title: 'Users',
    icon: HiOutlineUserGroup,
    submenu: [
      { 
        title: 'Users', 
        path: '/admin/users',
        icon: HiOutlineUsers,
        description: 'Manage all system users'
      },
      { 
        title: 'Verification', 
        path: '/admin/users/verification',
        icon: HiOutlineBadgeCheck,
        description: 'Email and phone verification requests'
      },
      { 
        title: 'Access Control', 
        path: '/admin/users/access',
        icon: HiOutlineShieldCheck,
        description: 'Manage user access and permissions'
      },
      { 
        title: 'Documents', 
        path: '/admin/users/documents',
        icon: HiOutlineDocumentDuplicate,
        description: 'User uploaded documents and files'
      },
    
    ]
  },
  {
    title: 'Lawyers',
    icon: HiOutlineScale,
    submenu: [
      { 
        title: 'All Lawyers', 
        path: '/admin/lawyers',
        icon: HiOutlineBriefcase,
        description: 'View and manage all lawyers'
      },
      {
        title: 'Specializations',
        path: '/admin/lawyers/specializations',
        icon: HiOutlineBadgeCheck,
        description: 'Manage lawyer expertise areas'
      },
      { 
        title: 'Faculty Workload', 
        path: '/admin/lawyers/workload',
        icon: HiOutlineChartBar,
        description: 'Monitor teaching staff case distribution and academic workload'
      }
    ]
  },
  {
    title: 'Cases',
    icon: HiOutlineScale,
    submenu: [
      { 
        title: 'Dashboard', 
        path: '/admin/cases/dashboard',
        icon: HiOutlineChartPie,
        description: 'Case analytics and metrics'
      },
      {
        title: 'New Case', 
        path: '/admin/cases/new',
        icon: HiOutlineUserGroup,
        description: 'Add new case'
      },
      { 
        title: 'Case Assignment', 
        path: '/admin/cases/assign',
        icon: HiOutlineUserGroup,
        description: 'Assign cases to lawyers'
      },
      { 
        title: 'Appeals', 
        path: '/admin/cases/appeals',
        icon: HiOutlineDocumentReport,
        description: 'Manage case appeals'
      }
    ]
  },
  {
    title: 'Offices',
    icon: HiOutlineOfficeBuilding,
    path: '/admin/offices'
  },
  {
    title: 'Services',
    icon: HiOutlineCash,
    submenu: [
      { title: 'Service Requests', path: '/admin/services/requests', icon: HiOutlineClipboardList, description: 'Manage service requests' },
      { title: 'Packages', path: '/admin/services/packages', icon: HiOutlineClipboardList, description: 'Manage service packages' },
      { title: 'Appeal Requests', path: '/admin/services/appeals', icon: HiOutlineClipboardList, description: 'Manage service appeals' }
    ]
  },
  {
    title: 'Coordinator',
    icon: HiOutlineUsers,
    submenu: [
      { 
        title: 'All Coordinators', 
        path: '/admin/coordinators', 
        icon: HiOutlineUserGroup,
        description: 'View and manage all coordinators' 
      },
      { 
        title: 'Add Coordinator', 
        path: '/admin/coordinators/new', 
        icon: HiOutlineUserAdd,
        description: 'Add new coordinator' 
      },
      { 
        title: 'Assignments', 
        path: '/admin/coordinators/assignments', 
        icon: HiOutlineClipboardList,
        description: 'Manage coordinator assignments' 
      }
    ]
  },
  {
    title: 'Reports',
    icon: HiOutlineDocumentReport,
    path: '/admin/reports',
    submenu: [
      { 
        title: 'dashboard', 
        path: '/admin/dashboard', 
        icon: HiOutlineDocumentReport,
        description: 'View and manage all reports' 
      },
      { 
        title: 'shared Report', 
        path: '/admin/reports/shared', 
        icon: HiOutlineDocumentReport,
        description: 'shared report' 
      }
    ]
  },
  {
    title: 'Settings',
    icon: HiOutlineCog,
    submenu: [
      
    ]
  }
];

// Add interfaces for the new functionality
interface VerificationRequest {
  id: string;
  userId: string;
  type: 'EMAIL' | 'PHONE';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

interface AccessRequest {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  user: {
    fullName: string;
    role: string;
  };
}

interface UserDocument {
  id: string;
  userId: string;
  title: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  size: number;
  mimeType: string;
}

interface SecuritySetting {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  loginAttempts: number;
  lastLoginAt: string;
  securityQuestions: boolean;
}

// Add these to your userService:
class UserService {
  // ... existing methods ...

  // Verification Methods
  async getVerificationRequests(): Promise<VerificationRequest[]> {
    const response = await fetch('/api/users/verification');
    const data = await response.json();
    return data.requests;
  }

  async approveVerification(requestId: string): Promise<void> {
    await fetch(`/api/users/verification/${requestId}/approve`, {
      method: 'POST'
    });
  }

  async rejectVerification(requestId: string): Promise<void> {
    await fetch(`/api/users/verification/${requestId}/reject`, {
      method: 'POST'
    });
  }

  // Access Control Methods
  async getAccessRequests(): Promise<AccessRequest[]> {
    const response = await fetch('/api/users/access');
    const data = await response.json();
    return data.requests;
  }

  async updateAccess(userId: string, permissions: string[]): Promise<void> {
    await fetch(`/api/users/${userId}/access`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions })
    });
  }

  // Document Management Methods
  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    const response = await fetch(`/api/users/${userId}/documents`);
    const data = await response.json();
    return data.documents;
  }

  async approveDocument(documentId: string): Promise<void> {
    await fetch(`/api/users/documents/${documentId}/approve`, {
      method: 'POST'
    });
  }

  // Security Methods
  async getUserSecurity(userId: string): Promise<SecuritySetting> {
    const response = await fetch(`/api/users/${userId}/security`);
    const data = await response.json();
    return data.security;
  }

  async updateSecuritySettings(userId: string, settings: Partial<SecuritySetting>): Promise<void> {
    await fetch(`/api/users/${userId}/security`, {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }
}

// Create corresponding API routes for each new endpoint
// src/app/api/users/verification/route.ts
// src/app/api/users/access/route.ts
// src/app/api/users/documents/route.ts
// src/app/api/users/security/route.ts

// Create new components for each section:
// src/components/admin/users/verification/VerificationTable.tsx
// src/components/admin/users/access/AccessControl.tsx
// src/components/admin/users/documents/DocumentManager.tsx
// src/components/admin/users/security/SecuritySettings.tsx

const Sidebar = () => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAdmin();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSubmenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isMenuOpen = (title: string) => openMenus.includes(title);

  const renderIcon = (Icon: React.ComponentType<{ className?: string }>) => {
    return <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" />;
  };

  const adminLinks = [
    // ... existing links
    {
      href: '/admin/users/verification',
      label: 'User Verification',
      icon: HiOutlineShieldCheck, // Add this import if not already present
      roles: ['ADMIN']
    },
    // ... other links
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && openMenus.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpenMenus([])}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
        border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 shadow-md
        ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg overflow-hidden">
              <img 
                src="/images/logo.svg" 
                alt="DU LADS" 
                className="w-8 h-8 absolute z-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = 'DU';
                  }
                }}
              />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300">
                DU LADS
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:block hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <HiOutlineChevronDown 
              className={`w-5 h-5 transform transition-transform duration-300 
                ${isCollapsed ? 'rotate-90' : '-rotate-90'}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`p-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
          ${isCollapsed ? 'overflow-x-hidden' : ''}`}
        >
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg
                      hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200
                      ${isMenuOpen(item.title) ? 'bg-primary-50 dark:bg-primary-900/20 font-medium' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      {renderIcon(item.icon)}
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                    {!isCollapsed && (
                      <motion.div
                        animate={{ rotate: isMenuOpen(item.title) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <HiOutlineChevronDown className="w-4 h-4" />
                      </motion.div>
                    )}
                  </button>
                  <AnimatePresence>
                    {isMenuOpen(item.title) && !isCollapsed && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-4 mt-2 space-y-1"
                      >
                        {item.submenu.map((subitem) => (
                          <motion.li
                            key={subitem.path}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                          >
                            <Link
                              href={subitem.path}
                              className={`flex items-center space-x-3 p-3 rounded-lg text-sm
                                hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200
                                ${isActive(subitem.path) 
                                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium shadow-sm' 
                                  : ''}`}
                            >
                              {renderIcon(subitem.icon)}
                              <span>{subitem.title}</span>
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href={item.path!}
                  className={`flex items-center space-x-3 p-3 rounded-lg
                    hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200
                    ${isActive(item.path!) 
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium shadow-sm' 
                      : ''}`}
                >
                  {renderIcon(item.icon)}
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="space-y-2">
            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 p-3 rounded-lg
                hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
            >
              {renderIcon(HiOutlineCog)}
              {!isCollapsed && <span>Settings</span>}
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg
                hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 transition-all duration-200 hover:shadow-sm"
            >
              {renderIcon(HiOutlineLogout)}
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 