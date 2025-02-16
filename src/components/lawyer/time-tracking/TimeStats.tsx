"use client";

import { motion } from 'framer-motion';
import { HiOutlineClock, HiOutlineCash, HiOutlineCalendar } from 'react-icons/hi';
import { TimeEntry } from '@/app/lawyer/time-tracking/page';

interface Props {
  entries: TimeEntry[];
}

export function TimeStats({ entries }: Props) {
  const today = new Date();
  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  });

  const totalHours = entries.reduce((acc, entry) => acc + entry.duration, 0) / 3600;
  const billableHours = entries
    .filter(entry => entry.billable)
    .reduce((acc, entry) => acc + entry.duration, 0) / 3600;
  
  const totalBillable = entries
    .filter(entry => entry.billable)
    .reduce((acc, entry) => acc + (entry.duration / 3600) * entry.rate, 0);

  const stats = [
    {
      title: "Today's Hours",
      value: todayEntries.reduce((acc, entry) => acc + entry.duration, 0) / 3600,
      format: (value: number) => `${value.toFixed(1)}h`,
      icon: HiOutlineCalendar,
      color: 'blue'
    },
    {
      title: 'Total Hours',
      value: totalHours,
      format: (value: number) => `${value.toFixed(1)}h`,
      icon: HiOutlineClock,
      color: 'green'
    },
    {
      title: 'Billable Hours',
      value: billableHours,
      format: (value: number) => `${value.toFixed(1)}h`,
      icon: HiOutlineClock,
      color: 'yellow'
    },
    {
      title: 'Billable Amount',
      value: totalBillable,
      format: (value: number) => `$${value.toFixed(2)}`,
      icon: HiOutlineCash,
      color: 'indigo'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.format(stat.value)}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}