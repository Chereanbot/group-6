"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlineMail,
  HiOutlineChat,
  HiOutlineBell
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { CoordinatorDashboard } from '@/components/coordinator/CoordinatorDashboard';
import { AIChatInterface } from '@/components/coordinator/AIChatInterface';
import { AgentNotifications } from '@/components/coordinator/AgentNotifications';
import { CoordinatorAgent } from '@/lib/agents/CoordinatorAgent';

// Add these interfaces at the top of the file
interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

interface ScheduleItemProps {
  time: string;
  title: string;
  type: 'meeting' | 'consultation' | 'task';
}

interface TaskItemProps {
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface QuickLinkProps {
  icon: React.ElementType;
  label: string;
  href: string;
}

export default function DashboardPage() {
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize the coordinator agent
    const agent = new CoordinatorAgent();
    agent.initialize().catch(console.error);

    // Check for unread notifications
    const checkUnreadNotifications = async () => {
      try {
        const response = await fetch('/api/coordinator/notifications/unread-count');
        if (response.ok) {
          const { count } = await response.json();
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkUnreadNotifications();
    const interval = setInterval(checkUnreadNotifications, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Quick Actions Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Coordinator Dashboard
            </h1>
            <div className="flex space-x-4">
              <QuickActionButton
                icon={HiOutlineBriefcase}
                label="New Case"
                href="/coordinator/cases/new"
              />
              <QuickActionButton
                icon={HiOutlineCalendar}
                label="Schedule"
                href="/coordinator/calendar"
              />
              <QuickActionButton
                icon={HiOutlineDocumentText}
                label="Documents"
                href="/coordinator/documents"
              />
              <QuickActionButton
                icon={HiOutlineMail}
                label="Messages"
                href="/coordinator/messages"
                badge="3"
              />
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent 
                  text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 
                  hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-primary-500"
              >
                <HiOutlineChat className="h-5 w-5 mr-2" />
                AI Chat
              </button>
              <button
                onClick={() => setShowNotifications(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent 
                  text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 
                  hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-primary-500 relative"
              >
                <HiOutlineBell className="h-5 w-5 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Dashboard Content */}
          <div className="col-span-12 lg:col-span-8">
            <CoordinatorDashboard />
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
              <div className="space-y-4">
                <ScheduleItem
                  time="09:00 AM"
                  title="Case Review Meeting"
                  type="meeting"
                />
                <ScheduleItem
                  time="11:30 AM"
                  title="Client Consultation"
                  type="consultation"
                />
                <ScheduleItem
                  time="02:00 PM"
                  title="Document Review"
                  type="task"
                />
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
              <div className="space-y-3">
                <TaskItem
                  title="Review Case Documents"
                  deadline="Today"
                  priority="high"
                />
                <TaskItem
                  title="Update Client Records"
                  deadline="Tomorrow"
                  priority="medium"
                />
                <TaskItem
                  title="Prepare Monthly Report"
                  deadline="Next Week"
                  priority="low"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickLink
                  icon={HiOutlineDocumentText}
                  label="Templates"
                  href="/coordinator/templates"
                />
                <QuickLink
                  icon={HiOutlineUserGroup}
                  label="Team"
                  href="/coordinator/team"
                />
                <QuickLink
                  icon={HiOutlineChartBar}
                  label="Reports"
                  href="/coordinator/reports"
                />
                <QuickLink
                  icon={HiOutlineCube}
                  label="Resources"
                  href="/coordinator/resources"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      {showChat && <AIChatInterface onClose={() => setShowChat(false)} />}

      {/* Agent Notifications */}
      {showNotifications && <AgentNotifications onClose={() => setShowNotifications(false)} />}
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, href, badge }: QuickActionButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="inline-flex items-center px-4 py-2 border border-transparent 
        text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 
        hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-primary-500 relative"
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
      {badge && (
        <span className="absolute -top-1 -right-1 px-2 py-1 text-xs font-bold 
          text-white bg-red-500 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function ScheduleItem({ time, title, type }: ScheduleItemProps) {
  const colors = {
    meeting: 'bg-blue-100 text-blue-800',
    consultation: 'bg-green-100 text-green-800',
    task: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-20 text-sm text-gray-500">{time}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
    </div>
  );
}

function TaskItem({ title, deadline, priority }: TaskItemProps) {
  const colors = {
    high: 'text-red-600 bg-red-100',
    medium: 'text-yellow-600 bg-yellow-100',
    low: 'text-green-600 bg-green-100'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-xs text-gray-500">Due: {deadline}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    </div>
  );
}

function QuickLink({ icon: Icon, label, href }: QuickLinkProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex flex-col items-center justify-center p-4 bg-gray-50 
        dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 
        transition-colors"
    >
      <Icon className="h-6 w-6 text-gray-500 dark:text-gray-400 mb-2" />
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
    </button>
  );
} 