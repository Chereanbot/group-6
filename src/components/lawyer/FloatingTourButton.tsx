'use client'

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingTourButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const startTour = () => {
    window.dispatchEvent(new Event('startTour'));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors z-50 group flex items-center gap-2"
          onClick={startTour}
        >
          <HelpCircle className="h-6 w-6" />
          <span className="hidden group-hover:inline whitespace-nowrap">Start Tour</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
} 