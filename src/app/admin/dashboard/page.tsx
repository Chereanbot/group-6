"use client";

import { useState, useEffect } from 'react';
import { DashboardStats, AdminActivity } from '@/types/admin.types';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import ChartCard from '@/components/admin/dashboard/ChartCard';
import ActivityItem from '@/components/admin/dashboard/ActivityItem';
import QuickActions from '@/components/admin/dashboard/QuickActions';
import { toast } from 'react-hot-toast';
import {
  HiOutlineUsers,
  HiOutlineScale,
  HiOutlineCash,
  HiOutlineChartBar,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineCog
} from 'react-icons/hi';
import CaseDistributionChart from '@/components/admin/dashboard/CaseDistributionChart';
import PerformanceMetrics from '@/components/admin/dashboard/PerformanceMetrics';
import ResourceUtilization from '@/components/admin/dashboard/ResourceUtilization';
import DashboardCustomizer from '@/components/admin/dashboard/DashboardCustomizer';

function SkeletonPulse() {
  return (
    <div className="animate-pulse">
      <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="ml-4 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
          <div className="mt-2 h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            <div className="mt-1 h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            <div className="mt-1 h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse" />
      <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Quick Actions Skeleton */}
      <div className="mb-8">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mb-4 animate-pulse" />
        <QuickActionsSkeleton />
      </div>

      {/* Primary Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Secondary Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent Activity Skeleton */}
      <ActivitySkeleton />
    </div>
  );
}

function LoadingError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="text-red-500 mb-4 text-lg">Failed to load dashboard data</div>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Retry</span>
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-preferences');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return null;
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

      setStats(result.data.stats);
      setActivities(result.data.activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !stats) {
    return <LoadingError onRetry={loadDashboardData} />;
  }

  const isSectionEnabled = (sectionId: string) => {
    if (!preferences?.sections) return true;
    const section = preferences.sections.find(s => s.id === sectionId);
    return section?.enabled ?? true;
  };

  const layoutClass = preferences?.layout === 'compact' ? 'space-y-4' : 'space-y-6';

  return (
    <div className="relative">
      {/* Customization Toggle Button */}
      <button
        onClick={() => setShowCustomizer(!showCustomizer)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200 z-50"
        title="Customize Dashboard"
      >
        <HiOutlineCog className={`w-6 h-6 ${showCustomizer ? 'rotate-180' : ''} transform transition-transform duration-200`} />
      </button>

      {/* Customization Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-40 overflow-y-auto ${
          showCustomizer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <DashboardCustomizer />
      </div>

      <div className={`p-6 ${layoutClass} ${showCustomizer ? 'mr-96' : ''} transition-all duration-300`}>
        {/* Quick Actions */}
        {isSectionEnabled('quick-actions') && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <QuickActions />
          </div>
        )}

        {/* Primary Stats Grid */}
        {isSectionEnabled('stats-cards') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.users.total}
              icon={<HiOutlineUsers className="w-6 h-6" />}
              change={stats.users.new}
              type="users"
              subStats={[
                { label: 'Lawyers', value: stats.users.lawyers },
                { label: 'Coordinators', value: stats.users.coordinators }
              ]}
            />
            <StatsCard
              title="Active Cases"
              value={stats.cases.active}
              icon={<HiOutlineScale className="w-6 h-6" />}
              change={stats.cases.pending}
              type="cases"
              subStats={[
                { label: 'Completed', value: stats.cases.completed },
                { label: 'Pending', value: stats.cases.pending }
              ]}
            />
            <StatsCard
              title="Revenue"
              value={`$${stats.services.revenue.toLocaleString()}`}
              icon={<HiOutlineCash className="w-6 h-6" />}
              change={5}
              type="revenue"
              subStats={[
                { label: 'Active Services', value: stats.services.active },
                { label: 'Completed', value: stats.services.completed }
              ]}
            />
            <StatsCard
              title="Documents"
              value={stats.documents.total}
              icon={<HiOutlineDocumentText className="w-6 h-6" />}
              change={stats.documents.pending}
              type="documents"
              subStats={[
                { label: 'Verified', value: stats.documents.verified },
                { label: 'Pending', value: stats.documents.pending }
              ]}
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isSectionEnabled('case-distribution') && (
            <CaseDistributionChart data={stats.caseDistribution} />
          )}
          {isSectionEnabled('performance-metrics') && (
            <PerformanceMetrics data={stats.performance} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isSectionEnabled('resource-utilization') && (
            <ResourceUtilization data={stats.resourceUtilization} />
          )}
          {isSectionEnabled('recent-activities') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add StatsCard, ChartCard, and ActivityItem components here... 