'use client'

import { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function FloatingTourButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    // Show button with a slight delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 2000);
    
    // Add attention-grabbing animation after appearing
    let bounceTimer: NodeJS.Timeout;
    if (isVisible) {
      bounceTimer = setTimeout(() => {
        const button = document.getElementById('floating-tour-button');
        if (button) {
          button.classList.add('bounce-animation');
          setTimeout(() => button.classList.remove('bounce-animation'), 3000);
        }
      }, 3000);
    }
    
    return () => {
      clearTimeout(timer);
      if (bounceTimer) clearTimeout(bounceTimer);
    };
  }, [isVisible]);

  const startTour = () => {
    window.dispatchEvent(new Event('startTour'));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-24 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
        >
          <motion.button
            id="floating-tour-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={startTour}
            className={cn(
              "relative overflow-hidden group",
              "flex items-center gap-2 px-4 py-3 rounded-xl",
              "bg-gradient-to-r from-[#00572d] to-[#1f9345] text-white",
              "shadow-lg shadow-[#00572d]/20",
              "border-2 border-[#f3c300]/30 hover:border-[#f3c300]",
              "transition-all duration-300 ease-in-out"
            )}
          >
            {/* Animated background effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[#1f9345]/30 to-[#f3c300]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'linear',
              }}
            />
            
            {/* Icon with glow effect */}
            <div className="relative">
              <motion.div
                animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <Play className="h-5 w-5 fill-[#f3c300] text-[#f3c300]" />
              </motion.div>
              <div className="absolute inset-0 bg-[#f3c300]/30 blur-md rounded-full z-0"></div>
            </div>
            
            <span className="font-medium text-sm">Start Interactive Tour</span>
            
            <motion.div
              animate={isHovered ? { x: 5 } : { x: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
            >
              <ChevronRight className="h-5 w-5 text-[#f3c300]" />
            </motion.div>
          </motion.button>
          
          {/* Add the CSS for bounce animation */}
          <style jsx global>{`
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
              40% {transform: translateY(-10px);}
              60% {transform: translateY(-5px);}
            }
            
            .bounce-animation {
              animation: bounce 2s ease infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 