"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineHome, HiOutlineArrowLeft, HiOutlineSupport, HiOutlineSearch } from 'react-icons/hi';
import Image from 'next/image';
import { useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div 
        className="max-w-lg w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Image with hover effect */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src="/404.svg"
            alt="404 Not Found"
            width={400}
            height={240}
            className="w-full max-w-md mx-auto"
            priority
          />
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The resource requested could not be found on this server!
          </p>
          <p className="text-gray-500 dark:text-gray-500 mb-8 text-sm">
            Error Code: 404
          </p>
        </motion.div>

        {/* Search Bar */}
        {showSearch && (
          <motion.div 
            variants={itemVariants}
            className="mb-8"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
          >
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search our site..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 
                  focus:ring-primary-500 focus:border-transparent"
              />
              <HiOutlineSearch className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent 
              text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 
              dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700
              shadow-sm transition-colors duration-200"
          >
            <HiOutlineArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent 
              text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 
              shadow-sm transition-colors duration-200"
          >
            <HiOutlineHome className="w-5 h-5 mr-2" />
            Back to Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSearch(!showSearch)}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent 
              text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 
              dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700
              shadow-sm transition-colors duration-200"
          >
            <HiOutlineSearch className="w-5 h-5 mr-2" />
            Search
          </motion.button>
        </motion.div>

        {/* Help Link */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 text-sm"
        >
          <button
            onClick={() => router.push('/support')}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 
              dark:hover:text-primary-300 inline-flex items-center"
          >
            <HiOutlineSupport className="w-4 h-4 mr-1" />
            Need help? Contact support
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}