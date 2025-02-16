"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  HiOutlineHome,
  HiOutlineScale,
  HiOutlineChatAlt2,
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiOutlinePlus,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineClipboardList
} from 'react-icons/hi';

const MobileFooter = () => {
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const quickActions = [
    {
      icon: <HiOutlinePhone className="w-6 h-6" />,
      label: 'Call',
      color: 'bg-green-500',
      action: () => router.push('/client/communication/call')
    },
    {
      icon: <HiOutlineVideoCamera className="w-6 h-6" />,
      label: 'Video',
      color: 'bg-blue-500',
      action: () => router.push('/client/communication/video-call')
    },
    {
      icon: <HiOutlineDocumentText className="w-6 h-6" />,
      label: 'New Case',
      color: 'bg-purple-500',
      action: () => router.push('/client/cases/new')
    },
    {
      icon: <HiOutlineCalendar className="w-6 h-6" />,
      label: 'Schedule',
      color: 'bg-orange-500',
      action: () => router.push('/client/appointments/book')
    }
  ];

  const mainTabs = [
    {
      id: 'home',
      icon: <HiOutlineHome className="w-6 h-6" />,
      label: 'Home',
      path: '/client/dashboard'
    },
    {
      id: 'cases',
      icon: <HiOutlineScale className="w-6 h-6" />,
      label: 'Cases',
      path: '/client/cases'
    },
    {
      id: 'chat',
      icon: <HiOutlineChatAlt2 className="w-6 h-6" />,
      label: 'Chat',
      path: '/client/communication/chat'
    },
    {
      id: 'schedule',
      icon: <HiOutlineClock className="w-6 h-6" />,
      label: 'Schedule',
      path: '/client/appointments'
    },
    {
      id: 'profile',
      icon: <HiOutlineUserCircle className="w-6 h-6" />,
      label: 'Profile',
      path: '/client/profile'
    }
  ];

  return (
    <>
      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showQuickActions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickActions(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="flex gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    onClick={() => {
                      action.action();
                      setShowQuickActions(false);
                    }}
                    className="flex flex-col items-center"
                  >
                    <div className={`p-4 rounded-full ${action.color} 
                      text-white shadow-lg hover:shadow-xl transform 
                      hover:scale-110 transition-all`}>
                      {action.icon}
                    </div>
                    <span className="mt-2 text-sm text-white font-medium
                      bg-gray-900/80 px-3 py-1 rounded-full">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Bar */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 
          border-t border-gray-200 dark:border-gray-700 z-30
          safe-area-bottom"
      >
        <div className="flex items-center justify-around h-16 px-4">
          {mainTabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                router.push(tab.path);
              }}
              className="relative flex flex-col items-center justify-center
                w-16 h-16"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{
                  scale: activeTab === tab.id ? 1.2 : 1,
                  color: activeTab === tab.id ? 'rgb(var(--color-primary-500))' : 'rgb(156, 163, 175)'
                }}
                className="relative z-10"
              >
                {tab.icon}
              </motion.div>
              <motion.span
                animate={{
                  opacity: activeTab === tab.id ? 1 : 0.7,
                  color: activeTab === tab.id ? 'rgb(var(--color-primary-500))' : 'rgb(156, 163, 175)'
                }}
                className="text-xs mt-1"
              >
                {tab.label}
              </motion.span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20
                    rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}

          {/* Quick Action Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2
              w-12 h-12 rounded-full bg-primary-500 text-white
              flex items-center justify-center shadow-lg
              hover:bg-primary-600 transition-colors"
          >
            <motion.div
              animate={{ 
                rotate: showQuickActions ? 45 : 0,
                scale: showQuickActions ? 1.1 : 1
              }}
            >
              <HiOutlinePlus className="w-6 h-6" />
            </motion.div>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default MobileFooter; 