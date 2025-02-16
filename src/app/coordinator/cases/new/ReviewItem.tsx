import React from 'react';

interface ReviewItemProps {
  label: string;
  value: string | number | boolean | null | undefined;
  icon?: React.ReactNode;
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ label, value, icon }) => {
  if (!value) return null;

  return (
    <div className="flex items-start space-x-3 p-4 bg-base-200 rounded-lg">
      {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
      <div>
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        <p className="mt-1 text-base">{value.toString()}</p>
      </div>
    </div>
  );
}; 