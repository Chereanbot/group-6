'use client';

import { FiDatabase, FiRefreshCw, FiAlertTriangle, FiMail, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const MESSAGES = [
  {
    en: "Database Connection Error",
    am: "የዳታቤዝ ግንኙነት ስህተት"
  },
  {
    en: "Unable to reach the database",
    am: "ዳታቤዙን ማግኘት አልተቻለም"
  },
  {
    en: "Please try again later",
    am: "እባክዎ ቆይተው ይሞክሩ"
  }
];

const CONTACT_INFO = [
  {
    icon: FiMail,
    text: "cherinetafework@gmail.com",
    link: "mailto:cherinetafework@gmail.com"
  },
  {
    icon: FiPhone,
    text: "+251947006369",
    link: "tel:+251947006369"
  },
  {
    icon: FiMessageCircle,
    text: "Live Chat Support",
    link: "https://t.me/mahiyenewudi"
  }
];

export default function DatabaseErrorPage() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Simulate retry attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRetrying(false);
    // Here you could add actual retry logic
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden relative">
      {/* Background animation */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '100px 100px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-full h-full opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl p-8 m-4 border border-white/20 relative z-10"
          >
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6)',
                backgroundSize: '400% 100%',
                filter: 'blur(3px)',
                opacity: 0.2,
                zIndex: -1,
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ rotate: -180, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 40px rgba(59, 130, 246, 0.3)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 p-5 rounded-full mb-6 shadow-lg relative"
                >
                  <FiDatabase className="w-12 h-12 text-white" strokeWidth={2} />
                </motion.div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4 mb-8"
                >
                  <motion.h1 
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    {MESSAGES[currentMessageIndex].en}
                  </motion.h1>
                  <motion.p
                    className="text-2xl font-semibold text-blue-400"
                    whileHover={{ scale: 1.05 }}
                  >
                    {MESSAGES[currentMessageIndex].am}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              <motion.div 
                className="w-full space-y-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {CONTACT_INFO.map((contact, index) => (
                  <motion.a
                    key={index}
                    href={contact.link}
                    className="flex items-center justify-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index }}
                  >
                    <contact.icon className="w-5 h-5" />
                    <span>{contact.text}</span>
                  </motion.a>
                ))}
              </motion.div>
              
              <div className="space-y-4 w-full">
                <motion.button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg px-6 py-3 hover:from-blue-700 hover:to-blue-900 transform transition-all duration-200 font-medium shadow-lg relative group overflow-hidden disabled:opacity-50"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                  <div className="flex items-center justify-center space-x-2">
                    <FiRefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
                  </div>
                </motion.button>
                
                <motion.a
                  href="/"
                  className="block w-full text-center text-gray-300 hover:text-white transition-colors duration-200 relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                >
                  Back to Home
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 