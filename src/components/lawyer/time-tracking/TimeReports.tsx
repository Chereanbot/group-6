"use client";

import { useState } from 'react';
import { TimeEntry } from '@/app/lawyer/time-tracking/page';
import { HiOutlineDocumentReport, HiOutlineDownload } from 'react-icons/hi';

interface Props {
  entries: TimeEntry[];
}

export function TimeReports({ entries }: Props) {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const generateReport = () => {
    const reportData = entries.reduce((acc, entry) => {
      const date = new Date(entry.startTime);
      const key = format(date, 'yyyy-MM-dd');
      
      if (!acc[key]) {
        acc[key] = {
          totalHours: 0,
          billableHours: 0,
          billableAmount: 0,
          entries: []
        };
      }

      acc[key].entries.push(entry);
      acc[key].totalHours += entry.duration / 3600;
      
      if (entry.billable) {
        acc[key].billableHours += entry.duration / 3600;
        acc[key].billableAmount += (entry.duration / 3600) * entry.rate;
      }

      return acc;
    }, {} as Record<string, any>);

    // You can implement different export formats (CSV, PDF, etc.)
    console.log(reportData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Time Reports</h3>
        <div className="flex items-center gap-4">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
          </select>
          <button
            onClick={generateReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <HiOutlineDownload className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Add report preview here */}
    </div>
  );
} 