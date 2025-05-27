"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineArrowRight, HiOutlineCheckCircle, HiX } from 'react-icons/hi';

interface PremiumBannerProps {
  className?: string;
  compact?: boolean;
}

export default function PremiumBanner({ className = '', compact = false }: PremiumBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  // Compact version for specific pages
  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 border-l-4 border-yellow-500 rounded-lg p-3 mb-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block">
              <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-yellow-400">
                <Image 
                  src="/images/get-ease.png" 
                  alt="Premium Services" 
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                Upgrade your free tier for priority service and dedicated lawyer
              </h4>
              <div className="flex items-center mt-1">
                <Link
                  href="/client/payments/upgrade"
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center"
                >
                  Learn more
                  <HiOutlineArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }
  
  // Full version for main display
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden shadow-md ${className}`}
    >
      <div className="relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 z-10"
        >
          <HiX className="w-5 h-5" />
        </button>
        
        <div className="p-4 sm:p-6">
          <div className="sm:flex items-start">
            <div className="mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
              <div className="relative w-full sm:w-32 h-24 sm:h-32 rounded-lg overflow-hidden">
                <Image 
                  src="/images/get-ease.png" 
                  alt="Premium Legal Services" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upgrade Your Free Tier for Enhanced Legal Support
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Get priority case handling, dedicated legal representation, and premium features to make your legal journey smoother and more efficient.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Priority case handling</span>
                </div>
                <div className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Assigned special lawyer</span>
                </div>
                <div className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Extended consultation hours</span>
                </div>
                <div className="flex items-start space-x-2">
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Premium document templates</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <Link
                  href="/client/payments/upgrade"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Upgrade Now
                </Link>
                <Link
                  href="/client/premium/features"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
