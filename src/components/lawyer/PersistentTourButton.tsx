'use client'

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

export function PersistentTourButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const startTour = () => {
    window.dispatchEvent(new Event('startTour'));
  };

  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-colors z-50 group flex items-center gap-2 ${
        isDark 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
      onClick={startTour}
    >
      <HelpCircle className="h-6 w-6" />
      <span className="hidden group-hover:inline whitespace-nowrap">Start Tour</span>
    </motion.button>
  );
} 