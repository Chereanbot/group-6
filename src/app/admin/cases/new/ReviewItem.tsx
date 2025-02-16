import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface ReviewItemProps {
  label: string;
  value: string | number | null | undefined;
  icon?: IconType;
  className?: string;
}

export function ReviewItem({ label, value, icon: Icon, className = '' }: ReviewItemProps) {
  if (!value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group p-4 bg-white dark:bg-gray-800 rounded-lg border 
        border-gray-200 dark:border-gray-700 hover:border-primary-500 
        dark:hover:border-primary-400 transition-all duration-200 ${className}`}
    >
      <div className="flex items-start space-x-3">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 
              group-hover:text-primary-500 dark:group-hover:text-primary-400 
              transition-colors duration-200" 
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 
            group-hover:text-gray-700 dark:group-hover:text-gray-300 
            transition-colors duration-200"
          >
            {label}
          </p>
          <p className="mt-1 text-base text-gray-900 dark:text-gray-100 
            break-words"
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
} 