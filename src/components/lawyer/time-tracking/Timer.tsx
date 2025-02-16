"use client";

import { useState, useEffect } from 'react';
import { HiOutlineClock } from 'react-icons/hi';

interface Props {
  startTime: Date | null;
  isRunning: boolean;
}

export function Timer({ startTime, isRunning }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning || !startTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-2xl font-mono">
      <HiOutlineClock className="w-6 h-6 text-primary-600" />
      <span>{formatTime(elapsed)}</span>
    </div>
  );
} 