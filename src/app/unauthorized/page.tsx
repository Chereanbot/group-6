'use client';

import { FiX, FiShield, FiAlertTriangle, FiMail, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Predefined positions to avoid hydration mismatch
const INITIAL_POSITIONS = [
  { x: -200, y: -200 },
  { x: 200, y: -200 },
  { x: -200, y: 200 },
  { x: 200, y: 200 },
  { x: 0, y: -300 },
  { x: 0, y: 300 },
  { x: -300, y: 0 },
  { x: 300, y: 0 },
];

const ICON_SIZES = [40, 50, 60, 70, 80, 90, 55, 65];

const MESSAGES = [
  {
    en: "Access Denied",
    am: "መዳረሻው ተከልክሏል"
  },
  {
    en: "You don't have permission to access this page",
    am: "ይህንን ገጽ የመድረስ ፈቃድ የለዎትም"
  },
  {
    en: "Please verify your credentials",
    am: "እባክዎ መረጃዎችዎን ያረጋግጡ"
  },
  {
    en: "Security violation detected",
    am: "የደህንነት ጥሰት ተገኝቷል"
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

export default function UnauthorizedPage() {
  const [isVisible, setIsVisible] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Rotate through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(messageInterval);
    };
  }, []);

  const floatingIcons = Array(8).fill(null).map((_, i) => ({
    id: i,
    icon: i % 2 === 0 ? FiShield : FiAlertTriangle,
    initialPosition: INITIAL_POSITIONS[i],
    size: ICON_SIZES[i]
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse" />
      
      {isClient && floatingIcons.map((item) => (
        <motion.div
          key={item.id}
          initial={{ 
            x: item.initialPosition.x,
            y: item.initialPosition.y,
            rotate: 0
          }}
          animate={{
            x: [
              item.initialPosition.x,
              item.initialPosition.x + 50,
              item.initialPosition.x
            ],
            y: [
              item.initialPosition.y,
              item.initialPosition.y + 50,
              item.initialPosition.y
            ],
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute text-white/5 pointer-events-none"
          style={{ fontSize: item.size }}
        >
          <item.icon />
        </motion.div>
      ))}

      {isClient && (
        <motion.div
          className="fixed pointer-events-none w-80 h-80 rounded-full"
          animate={{
            x: mousePosition.x - 160,
            y: mousePosition.y - 160,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            type: "spring", 
            damping: 30, 
            stiffness: 200,
            scale: {
              duration: 2,
              repeat: Infinity
            }
          }}
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)',
          }}
        />
      )}

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
                background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)',
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
                whileHover={{ scale: 1.1, rotate: 180 }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.5)',
                      '0 0 40px rgba(239, 68, 68, 0.3)',
                      '0 0 20px rgba(239, 68, 68, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-5 rounded-full mb-6 shadow-lg relative"
                >
                  <FiX className="w-12 h-12 text-white" strokeWidth={3} />
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full blur-xl opacity-50"
                />
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
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    {MESSAGES[currentMessageIndex].en}
                  </motion.h1>
                  <motion.p
                    className="text-2xl font-semibold text-red-400"
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
                <motion.a
                  href="/login"
                  className="block w-full text-center bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg px-6 py-3 hover:from-purple-700 hover:to-purple-900 transform transition-all duration-200 font-medium shadow-lg relative group overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                  Return to Login
                </motion.a>
                
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