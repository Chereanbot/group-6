'use client'

import { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function PersistentTourButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Show button after a short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    
    // Pulse animation to draw attention after appearing
    let pulseTimer: NodeJS.Timeout;
    if (isVisible) {
      pulseTimer = setTimeout(() => {
        const button = document.getElementById('tour-button');
        if (button) {
          button.classList.add('pulse-animation');
          setTimeout(() => button.classList.remove('pulse-animation'), 2000);
        }
      }, 2000);
    }
    
    return () => {
      clearTimeout(timer);
      if (pulseTimer) clearTimeout(pulseTimer);
    };
  }, [isVisible]);

  const startTour = () => {
    window.dispatchEvent(new Event('startTour'));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.button
        id="tour-button"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all duration-300",
          "bg-[#00572d] hover:bg-[#1f9345] text-white",
          "border-2 border-[#f3c300]/20 hover:border-[#f3c300]/80",
          "pulse-effect overflow-hidden"
        )}
        onClick={startTour}
      >
        <motion.div
          animate={isHovered ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex items-center justify-center"
        >
          <HelpCircle className="h-6 w-6" />
        </motion.div>
        
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={isHovered ? { width: 'auto', opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="whitespace-nowrap overflow-hidden font-medium flex items-center"
        >
          Start Tour <ChevronRight className="ml-1 h-4 w-4" />
        </motion.span>
        
        {/* Background glow effect */}
        <motion.div 
          className="absolute inset-0 bg-[#f3c300]/20 rounded-full blur-md -z-10"
          initial={{ opacity: 0 }}
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Add the CSS for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(243, 195, 0, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(243, 195, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(243, 195, 0, 0); }
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        .pulse-effect {
          position: relative;
        }
        
        .pulse-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(243, 195, 0, 0.7);
        }
      `}</style>
    </AnimatePresence>
  );
} 