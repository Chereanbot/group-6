'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, MessageSquare, Clock, AlertTriangle, X, Check } from 'lucide-react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, differenceInMilliseconds } from 'date-fns';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Props {
  lawyerCreatedAt: Date;
  appointments: any[];
  messages: any[];
  notifications: any[];
}

interface TimeState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export function DashboardAlerts({ lawyerCreatedAt, appointments, messages, notifications }: Props) {
  const [showAlerts, setShowAlerts] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });

  // Use localStorage with a more specific key
  const [storedProgress, setStoredProgress] = useLocalStorage<{
    timeLeft: TimeState;
    completedTasks: string[];
    lastVisit: string;
  }>('lawyer-onboarding-progress', {
    timeLeft: {
      days: 30,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    },
    completedTasks: [],
    lastVisit: new Date().toISOString()
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const createdDate = new Date(lawyerCreatedAt);
      const thirtyDaysFromCreation = new Date(createdDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      if (now >= thirtyDaysFromCreation) {
        clearInterval(timer);
        setStoredProgress(prev => ({
          ...prev,
          timeLeft: {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
          }
        }));
        return;
      }

      const diff = thirtyDaysFromCreation.getTime() - now.getTime();
      const newTime = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        milliseconds: diff % 1000
      };

      setTimeLeft(newTime);
      setStoredProgress(prev => ({
        ...prev,
        timeLeft: newTime,
        lastVisit: now.toISOString()
      }));
    }, 10);

    return () => clearInterval(timer);
  }, [lawyerCreatedAt, setStoredProgress]);

  // Track completed tasks
  const toggleTask = (taskId: string) => {
    setStoredProgress(prev => ({
      ...prev,
      completedTasks: prev.completedTasks.includes(taskId)
        ? prev.completedTasks.filter(id => id !== taskId)
        : [...prev.completedTasks, taskId]
    }));
  };

  // Check if a task is completed
  const isTaskCompleted = (taskId: string) => {
    return storedProgress.completedTasks.includes(taskId);
  };

  const getTimeMessage = () => {
    if (timeLeft.days > 25) {
      return "Welcome! You're just getting started. Take your time to explore all features.";
    } else if (timeLeft.days > 20) {
      return "Great progress! Have you completed your profile and explored the calendar?";
    } else if (timeLeft.days > 15) {
      return "You're doing well! Don't forget to check out document management features.";
    } else if (timeLeft.days > 10) {
      return "More than halfway through! Make sure to set up your communication preferences.";
    } else if (timeLeft.days > 5) {
      return "Time's moving fast! Have you tried all the key features yet?";
    } else if (timeLeft.days > 0) {
      return "Final countdown! Complete any remaining setup tasks soon.";
    }
    return "Onboarding period is complete!";
  };

  const daysAsMember = differenceInDays(new Date(), new Date(lawyerCreatedAt));
  const isNewLawyer = daysAsMember <= 30;
  const isFirstWeek = daysAsMember <= 7;

  // Get today's appointments
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledFor);
    return aptDate.toDateString() === new Date().toDateString();
  });

  // Get unread messages
  const unreadMessages = messages.filter(msg => !msg.readAt);

  // Get urgent notifications
  const urgentNotifications = notifications.filter(notif => 
    notif.priority === 'URGENT' && !notif.readAt
  );

  if (!isNewLawyer || !showAlerts) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isFirstWeek ? (
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              ) : (
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">
                  {isFirstWeek 
                    ? "Welcome to Your First Week!"
                    : `Day ${daysAsMember} of Your Journey`
                  }
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isFirstWeek 
                    ? "Let's help you get started with important tasks"
                    : "Here's what needs your attention today"
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowAlerts(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="sr-only">Dismiss</span>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Updated Timer Display */}
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Onboarding Progress
              </h4>
              <div className="flex justify-center items-center gap-2 text-3xl font-mono mb-3">
                <TimeUnit value={timeLeft.days} label="days" />
                <span className="text-gray-400">:</span>
                <TimeUnit value={timeLeft.hours} label="hrs" />
                <span className="text-gray-400">:</span>
                <TimeUnit value={timeLeft.minutes} label="min" />
                <span className="text-gray-400">:</span>
                <TimeUnit value={timeLeft.seconds} label="sec" />
                <span className="text-gray-400">:</span>
                <TimeUnit value={timeLeft.milliseconds} label="ms" digits={3} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {getTimeMessage()}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((30 - timeLeft.days) / 30) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Today's Appointments */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium">Today's Appointments</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {todayAppointments.length} scheduled
                </p>
              </div>
            </div>

            {/* Unread Messages */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Unread Messages</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {unreadMessages.length} new
                </p>
              </div>
            </div>

            {/* Urgent Notifications */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium">Urgent Matters</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {urgentNotifications.length} require attention
                </p>
              </div>
            </div>
          </div>

          {isFirstWeek && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-medium mb-2">First Week Checklist:</h4>
              <div className="space-y-2">
                <ChecklistItem 
                  label="Complete your profile" 
                  done={isTaskCompleted('profile')}
                  href="/lawyer/profile"
                  onClick={() => toggleTask('profile')}
                />
                <ChecklistItem 
                  label="Review the dashboard tour" 
                  done={isTaskCompleted('tour')}
                  onClick={() => {
                    toggleTask('tour');
                    window.dispatchEvent(new Event('startTour'));
                  }}
                />
                <ChecklistItem 
                  label="Set up your calendar" 
                  done={isTaskCompleted('calendar')}
                  href="/lawyer/calendar"
                  onClick={() => toggleTask('calendar')}
                />
                <ChecklistItem 
                  label="Check communication settings" 
                  done={isTaskCompleted('communications')}
                  href="/lawyer/settings/communications"
                  onClick={() => toggleTask('communications')}
                />
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

function TimeUnit({ value, label, digits = 2 }: { value: number; label: string; digits?: number }) {
  const formattedValue = value.toString().padStart(digits, '0');
  return (
    <div className="flex flex-col items-center">
      <span className="font-bold text-blue-600 dark:text-blue-400">
        {formattedValue}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {label}
      </span>
    </div>
  );
}

function ChecklistItem({ label, done, href, onClick }: { 
  label: string;
  done: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const content = (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-4 h-4 rounded-full border ${
        done 
          ? 'bg-green-500 border-green-500' 
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        {done && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={done ? 'line-through text-gray-500' : ''}>
        {label}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className="hover:text-blue-600 dark:hover:text-blue-400"
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className="hover:text-blue-600 dark:hover:text-blue-400"
    >
      {content}
    </button>
  );
} 