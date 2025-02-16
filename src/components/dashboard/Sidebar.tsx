"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CommunicationPanel from './CommunicationPanel';
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineChatAlt2,
  HiOutlineDocumentDuplicate,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUserCircle,
  HiOutlineClipboardCheck,
  HiOutlineCreditCard,
  HiOutlineDocumentSearch,
  HiOutlineClock,
  HiOutlineClipboardList,
  HiOutlineMailOpen,
  HiOutlinePencilAlt,
  HiOutlineScale,
  HiOutlineCash,
  HiOutlineCollection,
  HiOutlineDocument,
  HiOutlineRefresh,
  HiX,
  HiOutlinePlusCircle,
  HiOutlinePhotograph
} from 'react-icons/hi';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  subItems?: { title: string; path: string; icon: React.ReactNode; }[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: <HiOutlineHome className="w-6 h-6" />,
    path: '/client/dashboard'
  },
  {
    title: 'Payments',
    icon: <HiOutlineCreditCard className="w-6 h-6" />,
    path: '/client/payments',
    subItems: [
      { 
        title: 'Make Payment', 
        path: '/client/payments/new',
        icon: <HiOutlineCash className="w-5 h-5" />
      },
      { 
        title: 'Payment History', 
        path: '/client/payments/history',
        icon: <HiOutlineCollection className="w-5 h-5" />
      },
      { 
        title: 'Invoices', 
        path: '/client/payments/invoices',
        icon: <HiOutlineDocument className="w-5 h-5" />
      },
      { 
        title: 'Payment Methods', 
        path: '/client/payments/methods',
        icon: <HiOutlineCreditCard className="w-5 h-5" />
      },
      { 
        title: 'Subscriptions', 
        path: '/client/payments/subscriptions',
        icon: <HiOutlineRefresh className="w-5 h-5" />
      }
    ]
  },
  {
    title: 'Registration',
    icon: <HiOutlineDocumentText className="w-6 h-6" />,
    path: '/client/registration',
    subItems: [
      { 
        title: 'Personal Information', 
        path: '/client/registration/personal',
        icon: <HiOutlineUserCircle className="w-5 h-5" />
      },
      { 
        title: 'Case Details', 
        path: '/client/registration/case',
        icon: <HiOutlineClipboardCheck className="w-5 h-5" />
      },
      { 
        title: 'Document Upload', 
        path: '/client/registration/documents',
        icon: <HiOutlineDocumentDuplicate className="w-5 h-5" />
      },
      { 
        title: 'Payment Processing', 
        path: '/client/registration/payment',
        icon: <HiOutlineCreditCard className="w-5 h-5" />
      }
    ]
  },
  {
    title: 'Case Management',
    icon: <HiOutlineScale className="w-6 h-6" />,
    path: '/client/cases',
    subItems: [
      { 
        title: 'Active Cases', 
        path: '/client/cases/active',
        icon: <HiOutlineClipboardList className="w-5 h-5" />
      },
      { 
        title: 'File New Case', 
        path: '/client/cases/new',
        icon: <HiOutlinePlusCircle className="w-5 h-5" />
      },
      { 
        title: 'Case Timeline', 
        path: '/client/cases/timeline',
        icon: <HiOutlineClock className="w-5 h-5" />
      },
      { 
        title: 'Documents', 
        path: '/client/cases/documents',
        icon: <HiOutlineDocumentDuplicate className="w-5 h-5" />
      },
      { 
        title: 'Court Dates', 
        path: '/client/cases/court-dates',
        icon: <HiOutlineCalendar className="w-5 h-5" />
      },
      {
        title: 'Evidence Manager',
        path: '/client/cases/evidence',
        icon: <HiOutlinePhotograph className="w-5 h-5" />
      }
    ]
  },
  {
    title: 'Communication',
    icon: <HiOutlineChatAlt2 className="w-6 h-6" />,
    path: '/client/communication',
    subItems: [
      { 
        title: 'Message Lawyer', 
        path: '/client/communication/messages',
        icon: <HiOutlineMailOpen className="w-5 h-5" />
      },
      { 
        title: 'Submit Documents', 
        path: '/client/communication/documents',
        icon: <HiOutlineDocumentDuplicate className="w-5 h-5" />
      },
      { 
        title: 'Request Appointment', 
        path: '/client/communication/appointments',
        icon: <HiOutlineCalendar className="w-5 h-5" />
      }
    ]
  },
  {
    title: 'Forms & Documents',
    icon: <HiOutlineDocumentDuplicate className="w-6 h-6" />,
    path: '/client/forms',
    subItems: [
      { 
        title: 'Legal Aid Application', 
        path: '/client/forms/legal-aid',
        icon: <HiOutlineScale className="w-5 h-5" />
      },
      { 
        title: 'Financial Assessment', 
        path: '/client/forms/financial',
        icon: <HiOutlineCreditCard className="w-5 h-5" />
      },
      { 
        title: 'Document Templates', 
        path: '/client/forms/templates',
        icon: <HiOutlineDocumentText className="w-5 h-5" />
      },
      { 
        title: 'E-Signatures', 
        path: '/client/forms/signatures',
        icon: <HiOutlinePencilAlt className="w-5 h-5" />
      }
    ]
  },
  {
    title: 'Appointments',
    icon: <HiOutlineCalendar className="w-6 h-6" />,
    path: '/client/appointments',
    subItems: [
      { 
        title: 'My Appointments', 
        path: '/client/appointments/list',
        icon: <HiOutlineClipboardList className="w-5 h-5" />,
      },
      { 
        title: 'Book Appointment', 
        path: '/client/appointments/book',
        icon: <HiOutlinePlusCircle className="w-5 h-5" />,
      },
      { 
        title: 'Consultation History', 
        path: '/client/appointments/history',
        icon: <HiOutlineCollection className="w-5 h-5" />,
      },
      { 
        title: 'Available Slots', 
        path: '/client/appointments/slots',
        icon: <HiOutlineClock className="w-5 h-5" />,
      }
    ]
  }
];

const PaymentPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();

  const paymentOptions = [
    { 
      title: 'Make Payment', 
      path: '/client/payments/new',
      icon: <HiOutlineCash className="w-6 h-6" />,
      description: 'Make a new payment'
    },
    { 
      title: 'Payment History', 
      path: '/client/payments/history',
      icon: <HiOutlineCollection className="w-6 h-6" />,
      description: 'View your payment history'
    },
    { 
      title: 'Invoices', 
      path: '/client/payments/invoices',
      icon: <HiOutlineDocument className="w-6 h-6" />,
      description: 'View and download invoices'
    },
    { 
      title: 'Payment Methods', 
      path: '/client/payments/methods',
      icon: <HiOutlineCreditCard className="w-6 h-6" />,
      description: 'Manage payment methods'
    },
    { 
      title: 'Subscriptions', 
      path: '/client/payments/subscriptions',
      icon: <HiOutlineRefresh className="w-6 h-6" />,
      description: 'Manage your subscriptions'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Options</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {paymentOptions.map((option) => (
            <button
              key={option.path}
              className="w-full flex items-center space-x-4 p-4 rounded-lg
                bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 
                dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                router.push(option.path);
                onClose();
              }}
            >
              <div className="text-primary-500">{option.icon}</div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{option.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AppointmentPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();

  const appointmentOptions = [
    { 
      title: 'My Appointments', 
      path: '/client/appointments/list',
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      description: 'View your scheduled appointments'
    },
    { 
      title: 'Book Appointment', 
      path: '/client/appointments/book',
      icon: <HiOutlinePlusCircle className="w-6 h-6" />,
      description: 'Schedule a new appointment'
    },
    { 
      title: 'Consultation History', 
      path: '/client/appointments/history',
      icon: <HiOutlineCollection className="w-6 h-6" />,
      description: 'View past consultations'
    },
    { 
      title: 'Available Slots', 
      path: '/client/appointments/slots',
      icon: <HiOutlineClock className="w-6 h-6" />,
      description: 'Check available time slots'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Appointment Options</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {appointmentOptions.map((option) => (
            <button
              key={option.path}
              className="w-full flex items-center space-x-4 p-4 rounded-lg
                bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 
                dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                router.push(option.path);
                onClose();
              }}
            >
              <div className="text-primary-500">{option.icon}</div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{option.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CaseManagementPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();

  const caseOptions = [
    { 
      title: 'Active Cases',
      path: '/client/cases/active',
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      description: 'View and manage ongoing cases'
    },
    { 
      title: 'File New Case',
      path: '/client/cases/new',
      icon: <HiOutlinePlusCircle className="w-6 h-6" />,
      description: 'Start a new legal case'
    },
    { 
      title: 'Case Timeline',
      path: '/client/cases/timeline',
      icon: <HiOutlineClock className="w-6 h-6" />,
      description: 'Track case progress and events'
    },
    { 
      title: 'Documents',
      path: '/client/cases/documents',
      icon: <HiOutlineDocumentDuplicate className="w-6 h-6" />,
      description: 'Manage case-related documents'
    },
    { 
      title: 'Court Dates',
      path: '/client/cases/court-dates',
      icon: <HiOutlineCalendar className="w-6 h-6" />,
      description: 'View upcoming court appearances'
    },
    {
      title: 'Evidence Manager',
      path: '/client/cases/evidence',
      icon: <HiOutlinePhotograph className="w-6 h-6" />,
      description: 'Organize and submit evidence'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 
          rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Case Management</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your legal cases and documents
          </p>
        </div>

        {/* Options Grid */}
        <div className="p-6 grid gap-4">
          {caseOptions.map((option, index) => (
            <motion.button
              key={option.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                router.push(option.path);
                onClose();
              }}
              className="w-full flex items-center space-x-4 p-4 rounded-xl
                bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 
                dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center
                rounded-full bg-primary-100 dark:bg-primary-900/30 
                text-primary-500">
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
              <HiOutlineChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  );
};

const Sidebar = () => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activePath, setActivePath] = useState('');
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [showAppointmentPanel, setShowAppointmentPanel] = useState(false);
  const [showCasePanel, setShowCasePanel] = useState(false);
  const [showCommunicationPanel, setShowCommunicationPanel] = useState(false);

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);

  // Add back the toggleExpand function
  const toggleExpand = (title: string) => {
    setExpandedItem(expandedItem === title ? null : title);
  };

  // Update the mobile navigation items to be more concise
  const mobileNavItems = [
    {
      title: 'Home',
      icon: <HiOutlineHome className="w-6 h-6" />,
      path: '/client/dashboard'
    },
    {
      title: 'Pay',
      icon: <HiOutlineCreditCard className="w-6 h-6" />,
      path: '/client/payments/new'
    },
    {
      title: 'Book',
      icon: <HiOutlineCalendar className="w-6 h-6" />,
      action: () => setShowAppointmentPanel(true)
    },
    {
      title: 'Chat',
      icon: <HiOutlineChatAlt2 className="w-6 h-6" />,
      action: () => setShowCommunicationPanel(true)
    },
    {
      title: 'Cases',
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      action: () => setShowCasePanel(true)
    }
  ];

  // Mobile Footer Navigation
  const MobileNavigation = () => {
    if (!isMobile) return null;

    return (
      <>
        <nav className="mobile-footer-nav">
          <div className="mobile-nav-container">
            {mobileNavItems.map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  if (item.title === 'Pay') {
                    setShowPaymentPanel(true);
                  } else if (item.title === 'Book') {
                    setShowAppointmentPanel(true);
                  } else if (item.title === 'Cases') {
                    setShowCasePanel(true);
                  } else if (item.title === 'Chat') {
                    setShowCommunicationPanel(true);
                  } else if (item.path) {
                    router.push(item.path);
                  }
                }}
                className={`mobile-nav-item ${
                  activePath === item.path ? 'active' : ''
                }`}
              >
                <div className="mobile-nav-icon">{item.icon}</div>
                <span className="mobile-nav-text">{item.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <AnimatePresence>
          {showCasePanel && (
            <CaseManagementPanel 
              isOpen={showCasePanel} 
              onClose={() => setShowCasePanel(false)} 
            />
          )}
        </AnimatePresence>

        <PaymentPanel 
          isOpen={showPaymentPanel} 
          onClose={() => setShowPaymentPanel(false)} 
        />
        <AppointmentPanel 
          isOpen={showAppointmentPanel} 
          onClose={() => setShowAppointmentPanel(false)} 
        />
        <CommunicationPanel 
          isOpen={showCommunicationPanel}
          onClose={() => setShowCommunicationPanel(false)}
        />
      </>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => {
    if (isMobile) return null;

    return (
      <div className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <Link href="/client/dashboard" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                DulaCMS
              </span>
            </Link>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
              text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400
              transition-colors duration-200"
          >
            {isCollapsed ? <HiOutlineChevronRight className="w-5 h-5" /> : <HiOutlineChevronLeft className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {sidebarItems.map((item) => (
            <div key={item.title}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => item.subItems ? toggleExpand(item.title) : router.push(item.path)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-between'
                } p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  group transition-all duration-200
                  ${expandedItem === item.title ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-gray-500 dark:text-gray-400 
                    group-hover:text-primary-500 dark:group-hover:text-primary-400
                    transition-colors duration-200
                    ${expandedItem === item.title ? 'text-primary-500 dark:text-primary-400' : ''}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className={`text-gray-700 dark:text-gray-200 
                      group-hover:text-primary-500 dark:group-hover:text-primary-400
                      transition-colors duration-200
                      ${expandedItem === item.title ? 'text-primary-500 dark:text-primary-400' : ''}`}>
                      {item.title}
                    </span>
                  )}
                </div>
                {!isCollapsed && item.subItems && (
                  <motion.div
                    animate={{ rotate: expandedItem === item.title ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-500 dark:text-gray-400"
                  >
                    <HiOutlineChevronRight className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.button>

              {/* Sub Items */}
              {!isCollapsed && item.subItems && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: expandedItem === item.title ? 'auto' : 0,
                    opacity: expandedItem === item.title ? 1 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-8 mt-2 space-y-2">
                    {item.subItems.map((subItem) => (
                      <motion.div key={subItem.path}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={subItem.path}
                          className="flex items-center space-x-2 p-2 rounded-lg
                            hover:bg-gray-100 dark:hover:bg-gray-700 group
                            text-gray-700 dark:text-gray-200
                            hover:text-primary-500 dark:hover:text-primary-400
                            transition-all duration-200"
                        >
                          <div className="text-gray-500 dark:text-gray-400 
                            group-hover:text-primary-500 dark:group-hover:text-primary-400
                            transition-colors duration-200">
                            {subItem.icon}
                          </div>
                          <span>{subItem.title}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <>
      <DesktopSidebar />
      <MobileNavigation />
    </>
  );
};

export default Sidebar; 