"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineStar, HiOutlineArrowRight, HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineCash } from 'react-icons/hi';
import { getServiceType } from '@/utils/userSession';

export default function SidebarPremiumPromo({ isCollapsed = false }) {
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [adState, setAdState] = useState(0); // For cycling through different ad states
  
  useEffect(() => {
    // Get user's service type
    const userServiceType = getServiceType();
    setServiceType(userServiceType);
    
    // Cycle through different ad states for animation variety
    const adInterval = setInterval(() => {
      setAdState(prev => (prev + 1) % 3);
    }, 4000);
    
    return () => clearInterval(adInterval);
  }, []);
  
  // Don't show for paid users
  if (serviceType === 'paid') return null;
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 }
  };
  
  const pulseAnimation = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };
  
  // Collapsed version (icon only)
  if (isCollapsed) {
    return (
      <div className="px-2 py-4 mt-auto">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 1
          }}
          className="relative"
        >
          <Link
            href="/client/registration/payment"
            className="flex justify-center"
          >
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={adState}
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-white"
                >
                  {adState === 0 && <HiOutlineStar className="w-6 h-6" />}
                  {adState === 1 && <HiOutlineLightningBolt className="w-6 h-6" />}
                  {adState === 2 && <HiOutlineCash className="w-6 h-6" />}
                </motion.div>
              </AnimatePresence>
              
              <motion.div
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="absolute inset-0 rounded-full bg-yellow-400"
              />
            </div>
          </Link>
        </motion.div>
      </div>
    );
  }
  
  // Full version - positioned at the bottom with ad-like animations
  return (
    <div className="mt-auto px-4 py-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={containerVariants}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden shadow-md border border-yellow-200 dark:border-yellow-900 relative"
      >
        {/* Animated sparkles */}
        <motion.div 
          className="absolute right-2 top-2 text-yellow-400 z-10"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, 0, -15, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <HiOutlineSparkles className="w-5 h-5" />
        </motion.div>
        {/* Premium badge */}
        <div className="absolute -right-1 -top-1 z-10">
          <motion.div
            variants={pulseAnimation}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-xs font-bold text-gray-900 px-2 py-0.5 rounded-md shadow-sm transform rotate-3"
          >
            <motion.span
              animate={{
                color: ['#000', '#FFF', '#000']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              PREMIUM
            </motion.span>
          </motion.div>
        </div>
        
        {/* Image with animated overlay */}
        <div className="relative h-24 w-full overflow-hidden">
          <Image 
            src="/images/get-ease.png" 
            alt="Premium Services" 
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 hover:scale-105"
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" 
            animate={{
              background: [
                'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          {/* Animated text overlay */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-2 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [10, 0, 10]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 1
            }}
          >
            <div className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
              <span className="text-xs font-bold text-white">Limited Time Offer!</span>
            </div>
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="p-3">
          <motion.h4 
            variants={itemVariants}
            className="text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center"
          >
            <span>Upgrade to Premium</span>
            <motion.span 
              className="ml-1 text-yellow-500"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              <HiOutlineStar className="w-4 h-4" />
            </motion.span>
          </motion.h4>
          
          <motion.div 
            variants={itemVariants}
            className="mb-3"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={adState}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                {adState === 0 && "Get priority service & dedicated lawyer support"}
                {adState === 1 && "Faster response times & premium resources"}
                {adState === 2 && "Special perks & exclusive legal templates"}
              </motion.p>
            </AnimatePresence>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link
              href="/client/payments/upgrade"
              className="group flex items-center justify-between w-full py-1.5 px-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs font-medium rounded-md transition-colors"
            >
              <motion.div
                animate={{
                  background: [
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
                    'linear-gradient(90deg, rgba(255,255,255,0) 100%, rgba(255,255,255,0.1) 150%, rgba(255,255,255,0) 200%)'
                  ],
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear"
                }}
                className="absolute inset-0 overflow-hidden rounded-md"
              />
              <span className="relative z-10">Go Premium</span>
              <motion.div
                animate={isHovered ? { x: 3 } : { x: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
