import { motion } from 'framer-motion';

export const LoadingSkeleton = () => {
  const shimmer = {
    hidden: { x: '-100%' },
    visible: {
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Title Skeleton */}
        <div className="relative w-1/4 h-8 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            variants={shimmer}
            initial="hidden"
            animate="visible"
          />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="relative h-32 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="relative h-24 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="relative h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                variants={shimmer}
                initial="hidden"
                animate="visible"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 