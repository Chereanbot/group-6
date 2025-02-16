"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  HiOutlineChatAlt2,
  HiOutlineMailOpen,
  HiOutlineDocumentDuplicate,
  HiOutlineCalendar,
  HiOutlineX,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineChevronRight
} from 'react-icons/hi';

interface CommunicationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommunicationPanel = ({ isOpen, onClose }: CommunicationPanelProps) => {
  const router = useRouter();

  const communicationOptions = [
    {
      title: 'Message Lawyer',
      path: '/client/communication/messages',
      icon: <HiOutlineMailOpen className="w-6 h-6" />,
      description: 'Send messages to your legal team',
      color: 'bg-blue-500'
    },
    {
      title: 'Submit Documents',
      path: '/client/communication/documents',
      icon: <HiOutlineDocumentDuplicate className="w-6 h-6" />,
      description: 'Upload and share case documents',
      color: 'bg-green-500'
    },
    {
      title: 'Request Appointment',
      path: '/client/communication/appointments',
      icon: <HiOutlineCalendar className="w-6 h-6" />,
      description: 'Schedule meetings with your lawyer',
      color: 'bg-purple-500'
    },
    {
      title: 'Voice Call',
      path: '/client/communication/call',
      icon: <HiOutlinePhone className="w-6 h-6" />,
      description: 'Start a voice call',
      color: 'bg-orange-500'
    },
    {
      title: 'Video Call',
      path: '/client/communication/video-call',
      icon: <HiOutlineVideoCamera className="w-6 h-6" />,
      description: 'Start a video conference',
      color: 'bg-pink-500'
    }
  ];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
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
                <div className="flex items-center space-x-3">
                  <HiOutlineChatAlt2 className="w-8 h-8 text-primary-500" />
                  <h2 className="text-xl font-bold">Communication</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with your legal team
              </p>
            </div>

            {/* Options */}
            <div className="p-6 space-y-4">
              {communicationOptions.map((option, index) => (
                <motion.button
                  key={option.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  onClick={() => {
                    router.push(option.path);
                    onClose();
                  }}
                  className="w-full flex items-center p-4 rounded-xl
                    bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 
                    dark:hover:bg-gray-700 transition-all group"
                >
                  <div className={`flex-shrink-0 w-12 h-12 ${option.color} 
                    rounded-full flex items-center justify-center text-white
                    transform group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <div className="ml-4 flex-1 text-left">
                    <h3 className="font-medium mb-0.5">{option.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                  <HiOutlineChevronRight className="w-5 h-5 text-gray-400
                    transform group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 
              border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 dark:text-gray-400
                    hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    router.push('/client/communication/messages');
                    onClose();
                  }}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg
                    hover:bg-primary-600 transition-colors"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommunicationPanel; 