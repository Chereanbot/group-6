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
  HiOutlineChartBar
} from 'react-icons/hi';
import { getDashboardStats, getRecentActivity } from '@/app/actions/dashboard';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity()
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div>Loading...</div>;
  }

  // Add this mock data or fetch real data
  const caseStats = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Cases',
      data: [12, 19, 3, 5, 2, 3],
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F633'
    }]
  };

  const revenueStats = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [1200, 1900, 300, 500, 200, 300],
      borderColor: '#10B981',
      backgroundColor: '#10B98133'
    }]
  };

  return (
    <div className="space-y-6 p-6">
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.users.total}
          icon={<HiOutlineUsers className="w-6 h-6" />}
          change={stats.users.new}
          type="users"
        />
        <StatsCard
          title="Active Cases"
          value={stats.cases.active}
          icon={<HiOutlineScale className="w-6 h-6" />}
          change={stats.cases.pending}
          type="cases"
        />
        <StatsCard
          title="Revenue"
          value={`$${stats.services.revenue.toLocaleString()}`}
          icon={<HiOutlineCash className="w-6 h-6" />}
          change={5}
          type="revenue"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.performance.successRate.toFixed(1)}%`}
          icon={<HiOutlineChartBar className="w-6 h-6" />}
          change={2}
          type="performance"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Case Statistics" 
          data={caseStats}
          type="line"
        />
        <ChartCard 
          title="Revenue Overview" 
          data={revenueStats}
          type="bar"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add StatsCard, ChartCard, and ActivityItem components here... 