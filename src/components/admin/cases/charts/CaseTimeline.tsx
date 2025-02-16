"use client";

import { motion } from 'framer-motion';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  icon?: JSX.Element;
}

interface CaseTimelineProps {
  data: TimelineEvent[];
}

export function CaseTimeline({ data }: CaseTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      
      <div className="space-y-6">
        {data.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-10"
          >
            <div className="absolute left-0 p-2 bg-white dark:bg-gray-800 rounded-full border-2 border-primary-500">
              {event.icon}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h4 className="font-semibold">{event.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.description}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">
                {new Date(event.date).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 