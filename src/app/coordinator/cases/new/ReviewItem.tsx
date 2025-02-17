import React, { ReactNode } from 'react';

interface ReviewItemProps {
  label: string;
  value: string | number | null;
  icon?: ReactNode;
  className?: string;
}

export function ReviewItem({ label, value, icon, className = '' }: ReviewItemProps) {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      {icon && <div className="flex-shrink-0 mt-1 text-gray-400">{icon}</div>}
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
        <p className="mt-1 text-gray-900 dark:text-white">
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );
} 