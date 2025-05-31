"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { isFirstTimeLogin, getServiceType } from '@/utils/userSession';
import SidebarPremiumPromo from '@/components/premium/SidebarPremiumPromo';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CommunicationPanel from './CommunicationPanel';
import { useLanguage } from '@/providers/LanguageProvider';
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

const createSidebarItems = (t: (key: string) => string): SidebarItem[] => [
  {
    title: t('sidebar.dashboard'),
    icon: <HiOutlineHome className="w-6 h-6" />,
    path: '/client/dashboard'
  },
 
  {
    title: t('sidebar.registration'),
    icon: <HiOutlineDocumentText className="w-6 h-6" />,
    path: '/client/registration',
    subItems: [
      { 
        title: t('sidebar.serviceSelection'), 
        path: '/client/registration/service-selection',
        icon: <HiOutlineUserCircle className="w-5 h-5" />
      },
      {
        title: t('sidebar.personalInformation'),
        path: '/client/registration/',
        icon: <HiOutlineUserCircle className="w-5 h-5" />
      },
      { 
        title: t('sidebar.payment'), 
        path: '/client/registration/payment',
        icon: <HiOutlineCreditCard className="w-5 h-5" />
      },
      { 
        title: t('sidebar.paymentHistory'), 
        path: '/client/registration/payment/history',
        icon: <HiOutlineCreditCard className="w-5 h-5" />
      },

      { 
        title: t('sidebar.documentUpload'), 
        path: '/client/registration/documents',
        icon: <HiOutlineDocumentDuplicate className="w-5 h-5" />
      }
    ]
    },
    {
      title: 'My Info',
      icon: <HiOutlineUserCircle className="w-6 h-6" />,
      path: '/client/myinfo',
      subItems: [
        { 
          title: 'My Info', 
          path: '/client/myinfo',
          icon: <HiOutlineUserCircle className="w-5 h-5" />
        }
      ]
    },
  {
    title: t('sidebar.cases'),
    icon: <HiOutlineScale className="w-6 h-6" />,
    path: '/client/cases',
    subItems: [
      {
         title: t('sidebar.newCase'),
         path: '/client/cases/register',
         icon: <HiOutlinePlusCircle className="w-5 h-5" />
      },

      {
        title: t('sidebar.caseProgress'),
        path: '/client/cases/progress',
        icon: <HiOutlineClipboardList className="w-5 h-5" />
      },
    
      { 
        title: t('sidebar.myCases'), 
        path: '/client/cases/my-cases',
        icon: <HiOutlineClipboardList className="w-5 h-5" />
      },
     
      { 
        title: t('sidebar.waitingCases'), 
        path: '/client/cases/waiting',
        icon: <HiOutlineClock className="w-5 h-5" />
      },
    
      { 
        title: t('sidebar.caseActivity'), 
        path: '/client/cases/case-activity',
        icon: <HiOutlineCalendar className="w-5 h-5" />
      },
   
    ]
  },
  {
    title: t('sidebar.communications'),
    icon: <HiOutlineChatAlt2 className="w-6 h-6" />,
    path: '/client/communications',
    subItems: [
      { 
        title: t('sidebar.messageLawyer'), 
        path: '/client/communications/messages',
        icon: <HiOutlineMailOpen className="w-5 h-5" />
      },
    
    ]
  },
  {
    title: t('sidebar.documents'),
    icon: <HiOutlineDocumentDuplicate className="w-6 h-6" />,
    path: '/client/documents',
    subItems: [
      { 
        title: t('sidebar.documentList'), 
        path: '/client/documents',
        icon: <HiOutlineScale className="w-5 h-5" />
      },
     
    
      { 
        title: t('sidebar.eSignatures'), 
        path: '/client/forms/signatures',
        icon: <HiOutlinePencilAlt className="w-5 h-5" />
      }
    ]
  },
  {
    title: t('sidebar.appointments'),
    icon: <HiOutlineCalendar className="w-6 h-6" />,
    path: '/client/appointments',
    subItems: [
      { 
        title: t('sidebar.myAppointments'), 
        path: '/client/appointments/list',
        icon: <HiOutlineClipboardList className="w-5 h-5" />,
      },
      { 
        title: t('sidebar.bookAppointment'), 
        path: '/client/appointments/book',
        icon: <HiOutlinePlusCircle className="w-5 h-5" />,
      },
     
    ]
  }
];

const PaymentPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();
  const { t } = useLanguage();

  const paymentOptions = [
    { 
      title: t('sidebar.payment'), 
      path: '/client/payments/new',
      icon: <HiOutlineCash className="w-6 h-6" />,
      description: t('sidebar.payment')
    },
    { 
      title: t('sidebar.paymentHistory'), 
      path: '/client/payments/history',
      icon: <HiOutlineCollection className="w-6 h-6" />,
      description: t('sidebar.paymentHistory')
    },
    { 
      title: t('sidebar.documentList'), 
      path: '/client/payments/invoices',
      icon: <HiOutlineDocument className="w-6 h-6" />,
      description: t('sidebar.documentList')
    },
    { 
      title: t('sidebar.paymentMethods'), 
      path: '/client/payments/methods',
      icon: <HiOutlineCreditCard className="w-6 h-6" />,
      description: t('sidebar.paymentMethods')
    },
    { 
      title: t('sidebar.subscriptions'), 
      path: '/client/payments/subscriptions',
      icon: <HiOutlineRefresh className="w-6 h-6" />,
      description: t('sidebar.subscriptions')
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('sidebar.payment')}</h2>
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
  const { t } = useLanguage();

  const appointmentOptions = [
    { 
      title: t('sidebar.myAppointments'), 
      path: '/client/appointments/list',
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      description: t('appointments.history.description')
    },
    { 
      title: t('sidebar.bookAppointment'), 
      path: '/client/appointments/book',
      icon: <HiOutlinePlusCircle className="w-6 h-6" />,
      description: t('appointments.history.description')
    },
    { 
      title: t('sidebar.appointmentHistory'), 
      path: '/client/appointments/history',
      icon: <HiOutlineClock className="w-6 h-6" />,
      description: t('appointments.history.description')
    },
    { 
      title: t('sidebar.availableSlots'), 
      path: '/client/appointments/slots',
      icon: <HiOutlineClock className="w-6 h-6" />,
      description: t('appointments.availableSlots')
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('sidebar.appointments')}</h2>
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
  const { t } = useLanguage();

  const caseOptions = [
    { 
      title: t('sidebar.myCases'),
      path: '/client/cases/active',
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      description: t('sidebar.myCases')
    },
    { 
      title: t('sidebar.newCase'),
      path: '/client/cases/new',
      icon: <HiOutlinePlusCircle className="w-6 h-6" />,
      description: t('sidebar.newCase')
    },
    { 
      title: t('sidebar.caseProgress'),
      path: '/client/cases/timeline',
      icon: <HiOutlineClipboardCheck className="w-6 h-6" />,
      description: t('sidebar.caseProgress')
    },
    { 
      title: t('sidebar.documents'),
      path: '/client/cases/documents',
      icon: <HiOutlineDocumentDuplicate className="w-6 h-6" />,
      description: t('sidebar.documents')
    },
    { 
      title: t('sidebar.cases'),
      path: '/client/cases/search',
      icon: <HiOutlineDocumentSearch className="w-6 h-6" />,
      description: t('sidebar.cases')
    },
    {
      title: t('sidebar.evidenceManager'),
      path: '/client/cases/evidence',
      icon: <HiOutlinePhotograph className="w-6 h-6" />,
      description: t('sidebar.evidenceManager')
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
            <h2 className="text-xl font-bold">{t('sidebar.caseManagement')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('sidebar.caseManagementDescription')}
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
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [showAppointmentPanel, setShowAppointmentPanel] = useState(false);
  const [showCasePanel, setShowCasePanel] = useState(false);
  const [showCommunicationPanel, setShowCommunicationPanel] = useState(false);
  
  const sidebarItems = createSidebarItems(t);

  useEffect(() => {
    // Close expanded items on mobile when window resizes
    if (isMobile) {
      setExpandedItem(null);
      setIsCollapsed(false);
    }
    
    // Check if this is the user's first visit
    const firstTimeUser = isFirstTimeLogin();
    setIsFirstVisit(firstTimeUser);
    
    // Show tutorial for first-time users after a short delay
    if (firstTimeUser) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Auto-expand the sidebar item that matches the current path
  useEffect(() => {
    if (!pathname) return;
    
    // Find which sidebar item matches the current path
    const matchingItem = sidebarItems.find(item => {
      if (pathname === item.path) return true;
      if (item.subItems) {
        return item.subItems.some(subItem => pathname === subItem.path);
      }
      return false;
    });
    
    if (matchingItem && !isMobile) {
      setExpandedItem(matchingItem.title);
    }
  }, [pathname, isMobile]);

  // Add back the toggleExpand function
  const toggleExpand = (title: string) => {
    setExpandedItem(expandedItem === title ? null : title);
  };

  // Update the mobile navigation items to be more concise
  const mobileNavItems = [
    {
      title: t('mobile.home'),
      icon: <HiOutlineHome className="w-6 h-6" />,
      path: '/client/dashboard'
    },
    {
      title: t('mobile.cases'),
      icon: <HiOutlineScale className="w-6 h-6" />,
      action: () => setShowCasePanel(true)
    },
    {
      title: t('mobile.book'),
      icon: <HiOutlineCalendar className="w-6 h-6" />,
      action: () => setShowAppointmentPanel(true)
    },
    {
      title: t('mobile.chat'),
      icon: <HiOutlineChatAlt2 className="w-6 h-6" />,
      action: () => setShowCommunicationPanel(true)
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
                Dulas
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
        <nav className="p-4 space-y-2 overflow-y-auto flex flex-col max-h-[calc(100vh-4rem)]">
          <div className="flex-1 space-y-2">
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
          </div>
          
          {/* Premium promotion at the bottom of sidebar */}
          <SidebarPremiumPromo isCollapsed={isCollapsed} />
        </nav>
      </div>
    );
  };

  // Tutorial overlay for first-time users
  const SidebarTutorial = () => {
    if (!showTutorial) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={() => setShowTutorial(false)}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md m-4"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('tutorial.welcome')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('tutorial.guide')}
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start space-x-2">
              <span className="text-primary-500 font-bold">•</span>
              <span className="text-gray-600 dark:text-gray-300">{t('tutorial.clickMenu')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-500 font-bold">•</span>
              <span className="text-gray-600 dark:text-gray-300">{t('tutorial.expandItems')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-500 font-bold">•</span>
              <span className="text-gray-600 dark:text-gray-300">{t('tutorial.collapseSidebar')}</span>
            </li>
          </ul>
          <button
            onClick={() => setShowTutorial(false)}
            className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            {t('tutorial.gotIt')}
          </button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <DesktopSidebar />
      <MobileNavigation />
      {isFirstVisit && <SidebarTutorial />}
    </>
  );
};

export default Sidebar;