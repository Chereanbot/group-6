"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HiX, HiOutlineStar, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi';
import { getServiceType } from '@/utils/userSession';

interface UpgradePromotionProps {
  className?: string;
}

export default function UpgradePromotion({ className = '' }: UpgradePromotionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [serviceType, setServiceType] = useState<string | null>(null);
  
  useEffect(() => {
    // Only show promotion after a delay and if user is on free tier
    const userServiceType = getServiceType();
    setServiceType(userServiceType);
    
    if (userServiceType === 'aid') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Don't show for paid users
  if (serviceType === 'paid' || !isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-40 ${className}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-md">
          {/* Header */}
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <button 
                onClick={handleDismiss}
                className="p-1 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative h-40 w-full overflow-hidden">
              <Image 
                src="/images/get-ease.png" 
                alt="Premium Services" 
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <div className="flex items-center space-x-1 text-yellow-400 mb-1">
                    <HiOutlineStar className="w-5 h-5" />
                    <HiOutlineStar className="w-5 h-5" />
                    <HiOutlineStar className="w-5 h-5" />
                    <HiOutlineStar className="w-5 h-5" />
                    <HiOutlineStar className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Upgrade Your Legal Experience</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Unlock premium features to enhance your legal service experience:
            </p>
            
            <motion.div 
              animate={{ height: isExpanded ? 'auto' : '100px' }}
              className="overflow-hidden"
            >
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Priority case handling and faster response times</span>
                </li>
                <li className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Dedicated legal advisor assigned to your cases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Comprehensive document preparation assistance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Extended consultation hours with legal experts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Access to premium legal templates and resources</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Show more/less toggle */}
            <button 
              onClick={toggleExpand}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium mt-2 flex items-center"
            >
              {isExpanded ? 'Show less' : 'Show more'}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="ml-1"
              >
                <HiOutlineArrowRight className="w-4 h-4 rotate-90" />
              </motion.div>
            </button>
          </div>
          
          {/* Action button */}
          <div className="px-4 pb-4">
            <Link
              href="/client/payments/upgrade"
              className="block w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-center font-medium transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
