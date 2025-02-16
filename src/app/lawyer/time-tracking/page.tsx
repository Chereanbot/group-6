"use client";

import { useState, useEffect } from 'react';
import { TimeTracker } from '@/components/lawyer/time-tracking/TimeTracker';
import { TimeEntryList } from '@/components/lawyer/time-tracking/TimeEntryList';
import { TimeStats } from '@/components/lawyer/time-tracking/TimeStats';
import { Timer } from '@/components/lawyer/time-tracking/Timer';
import { TimeFilters } from '@/components/lawyer/time-tracking/TimeFilters';
import { TimeReports } from '@/components/lawyer/time-tracking/TimeReports';
import { toast } from 'react-hot-toast';

export interface TimeEntry {
  id: string;
  caseId: string;
  caseName: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  billable: boolean;
  rate: number;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadTimeEntries();
  }, []);

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lawyer/time-entries');
      const data = await response.json();
      
      if (response.ok) {
        setEntries(data);
      } else {
        throw new Error(data.error || 'Failed to load time entries');
      }
    } catch (error) {
      console.error('Error loading time entries:', error);
      toast.error('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!entry.description.toLowerCase().includes(search) &&
          !entry.caseName.toLowerCase().includes(search)) {
        return false;
      }
    }

    if (filters.status?.length) {
      if (!filters.status.includes(entry.status)) {
        return false;
      }
    }

    if (typeof filters.billable === 'boolean') {
      if (entry.billable !== filters.billable) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Time Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your billable hours
          </p>
        </div>
      </div>

      <TimeFilters onFilterChange={setFilters} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <TimeStats entries={filteredEntries} />
          <div className="mt-6">
            <TimeTracker onEntryCreated={loadTimeEntries} />
          </div>
          <div className="mt-6">
            <TimeEntryList entries={filteredEntries} onEntryUpdate={loadTimeEntries} />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <TimeReports entries={filteredEntries} />
        </div>
      </div>
    </div>
  );
}