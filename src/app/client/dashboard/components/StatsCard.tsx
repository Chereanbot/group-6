import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = ({ title, value, icon: Icon, color, trend }: StatsCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg",
        "border border-gray-100 dark:border-gray-700"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="flex items-baseline mt-1">
            <p className={cn("text-2xl font-semibold", color)}>
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  "ml-2 text-sm",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          "bg-opacity-10",
          color.replace("text", "bg")
        )}>
          <Icon className={cn("w-6 h-6", color)} />
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -right-2 -bottom-2 w-24 h-24 opacity-5">
        <Icon className="w-full h-full" />
      </div>
    </motion.div>
  );
}; 