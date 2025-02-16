"use client";

import { motion } from 'framer-motion';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        {/* Skeleton Animation */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header Skeleton */}
          <div className="space-y-4">
            <motion.div
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center pt-8">
            <motion.div
              className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          {/* Loading Text */}
          <motion.div
            className="text-center"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <p className="text-gray-600 dark:text-gray-300">Loading content...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 