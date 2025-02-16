"use client";

import { useState, useEffect } from 'react';
import { HiOutlineUser, HiOutlineGlobe, HiOutlineClock, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  location?: {
    city?: string;
    country?: string;
  };
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveSessions();
    const interval = setInterval(loadActiveSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadActiveSessions = async () => {
    try {
      const response = await fetch('/api/admin/security/sessions');
      const data = await response.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/security/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }
      toast.success('Session terminated successfully');
      await loadActiveSessions();
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast.error('Failed to terminate session');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Sessions</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Currently active user sessions on the platform
        </p>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No active sessions found
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <HiOutlineUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.userName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.userEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => terminateSession(session.id)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Terminate Session"
                >
                  <HiOutlineX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <HiOutlineGlobe className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.location?.city && session.location?.country
                        ? `${session.location.city}, ${session.location.country}`
                        : 'Unknown Location'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.ipAddress}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <HiOutlineClock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Session Duration</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(session.loginTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last activity: {new Date(session.lastActivity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.userAgent}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 