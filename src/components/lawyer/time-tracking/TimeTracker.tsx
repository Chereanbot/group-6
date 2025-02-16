"use client";

import { useState } from 'react';
import { HiOutlinePlay, HiOutlinePause, HiOutlineStop, HiOutlineCash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface Props {
  onEntryCreated: () => void;
}

export function TimeTracker({ onEntryCreated }: Props) {
  const [selectedCase, setSelectedCase] = useState('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);
  const [rate, setRate] = useState(150);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleStart = async () => {
    if (!selectedCase || !description) {
      toast.error('Please select a case and add a description');
      return;
    }

    try {
      const response = await fetch('/api/lawyer/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCase,
          description,
          billable,
          rate,
          status: 'RUNNING'
        })
      });

      if (response.ok) {
        setIsTracking(true);
        setStartTime(new Date());
        toast.success('Timer started');
      } else {
        throw new Error('Failed to start timer');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      toast.error('Failed to start timer');
    }
  };

  const handleStop = async () => {
    try {
      const response = await fetch('/api/lawyer/time-entries/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCase,
          endTime: new Date()
        })
      });

      if (response.ok) {
        setIsTracking(false);
        setStartTime(null);
        setDescription('');
        setSelectedCase('');
        onEntryCreated();
        toast.success('Time entry saved');
      } else {
        throw new Error('Failed to stop timer');
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast.error('Failed to stop timer');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Case</label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              disabled={isTracking}
            >
              <option value="">Select a case...</option>
              {/* Add your cases here */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              placeholder="What are you working on?"
              disabled={isTracking}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
                disabled={isTracking}
              />
              <span className="text-sm">Billable</span>
            </label>

            {billable && (
              <div className="flex items-center gap-2">
                <HiOutlineCash className="w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-20 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  disabled={isTracking}
                />
                <span className="text-sm text-gray-500">/hour</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isTracking ? (
              <button
                onClick={handleStart}
                disabled={!selectedCase || !description}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <HiOutlinePlay className="w-5 h-5" />
                Start
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <HiOutlineStop className="w-5 h-5" />
                Stop
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}