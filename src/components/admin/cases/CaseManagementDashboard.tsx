"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineScale,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineExclamation,
  HiOutlineCheck,
  HiOutlineCalendar
} from 'react-icons/hi';
import { 
  LineChart, 
  PieChart, 
  BarChart, 
  CaseTimeline,
  MetricsCard,
  StackedBarChart,
  RadarChart
} from '@/components/admin/cases/charts';
import { caseService } from '@/services/case.service';
import { CaseMetrics, TimelineEvent, ChartData } from '@/types/case.types';

export default function CaseManagementDashboard() {
  const [metrics, setMetrics] = useState<CaseMetrics>({
    totalCases: 0,
    activeCases: 0,
    pendingCases: 0,
    resolvedCases: 0,
    highPriorityCases: 0,
    averageResolutionTime: 0,
    successRate: 0
  });
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    progressData: {
      labels: [],
      datasets: [{
        label: 'Cases',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }]
    },
    resolutionData: {
      labels: [],
      datasets: [{
        label: 'Cases',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }]
    },
    resolutionTrends: {
      labels: [],
      datasets: [
        {
          label: 'Resolved',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          stack: 'Stack 0',
        },
        {
          label: 'Pending',
          data: [],
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          stack: 'Stack 0',
        }
      ]
    },
    complexityData: {
      labels: [],
      datasets: [{
        label: 'Current Period',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        fill: true
      }]
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load each data type separately to handle individual failures
      const metricsData = await caseService.getCaseMetrics();
      const timelineData = await caseService.getCaseTimeline();
      const chartData = await caseService.getCaseChartData();

      setMetrics(metricsData);
      setTimelineData(timelineData);
      setChartData(chartData);
    } catch (error) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Cases"
          value={metrics.totalCases}
          icon={HiOutlineScale}
          trend={+12}
        />
        <MetricsCard
          title="Active Cases"
          value={metrics.activeCases}
          icon={HiOutlineChartBar}
          trend={+5}
          type="info"
        />
        <MetricsCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          icon={HiOutlineCheck}
          trend={+3}
          type="success"
        />
        <MetricsCard
          title="High Priority"
          value={metrics.highPriorityCases}
          icon={HiOutlineExclamation}
          trend={-2}
          type="warning"
        />
      </div>

      {/* Performance Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Case Resolution Trends</h3>
          <StackedBarChart
            data={chartData.resolutionTrends}
            title="Monthly Case Resolution"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Case Complexity Analysis</h3>
          <RadarChart data={chartData.complexityData} />
        </motion.div>
      </div>

      {/* Timeline and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Timeline */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow h-full"
          >
            <h3 className="text-lg font-semibold mb-4">Case Timeline</h3>
            <CaseTimeline data={timelineData} />
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {timelineData.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex-shrink-0">{activity.icon}</div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Resolution Time</p>
            <p className="text-2xl font-bold mt-2">{metrics.averageResolutionTime} days</p>
            <p className="text-xs text-green-500">-2 days from last month</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Case Clearance Rate</p>
            <p className="text-2xl font-bold mt-2">92%</p>
            <p className="text-xs text-green-500">+5% from last month</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Client Satisfaction</p>
            <p className="text-2xl font-bold mt-2">4.8/5</p>
            <p className="text-xs text-green-500">+0.2 from last month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 