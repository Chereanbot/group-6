"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { adminStyles } from '@/styles/admin';
import {
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineThumbUp,
  HiDownload
} from 'react-icons/hi';

type PerformanceMetric = 'completionRate' | 'responseTime' | 'clientSatisfaction';

interface PerformanceData {
  period: string;
  completionRate: number;
  responseTime: number;
  clientSatisfaction: number;
  totalAssignments: number;
}

interface TeamPerformance {
  averages: Record<PerformanceMetric, number>;
  topPerformers: Array<{
    coordinatorId: string;
    name: string;
    metric: PerformanceMetric;
    value: number;
  }>;
}

interface PerformanceFilter {
  period?: 'last-week' | 'last-month' | 'last-quarter' | 'last-year';
  coordinatorId?: string;
}

const PerformancePage = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance>();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PerformanceFilter>({
    period: 'last-month'
  });
  const { theme } = useTheme();

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.period) queryParams.append('period', filters.period);
      if (filters.coordinatorId) queryParams.append('coordinatorId', filters.coordinatorId);

      const response = await fetch(`/api/admin/coordinators/performance?${queryParams}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load performance data');
      }

      setPerformanceData(result.data.performanceData);
      setTeamPerformance(result.data.teamPerformance);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/coordinators/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${filters.period}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export report');
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, [filters]);

  if (loading) {
    return (
      <div className={adminStyles.loading.container}>
        <div className={adminStyles.loading.spinner}></div>
      </div>
    );
  }

  const chartColors = {
    completionRate: theme === 'dark' ? '#3B82F6' : '#2563EB',
    responseTime: theme === 'dark' ? '#10B981' : '#059669',
    clientSatisfaction: theme === 'dark' ? '#F59E0B' : '#D97706'
  };

  return (
    <div className={adminStyles.container}>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Performance Metrics</h1>
        <div className="flex gap-4">
          <select
            className={adminStyles.form.select}
            value={filters.period}
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as PerformanceFilter['period'] }))}
          >
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="last-year">Last Year</option>
          </select>
          <button
            onClick={handleExport}
            className={`${adminStyles.button.base} ${adminStyles.button.secondary}`}
          >
            <HiDownload className="w-5 h-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {teamPerformance && (
          <>
            <div className={adminStyles.stats.card}>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500 text-white">
                  <HiOutlineChartBar className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className={adminStyles.stats.title}>Completion Rate</h3>
                  <p className={adminStyles.stats.value}>
                    {teamPerformance.averages.completionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className={adminStyles.stats.card}>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <HiOutlineClock className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className={adminStyles.stats.title}>Response Time</h3>
                  <p className={adminStyles.stats.value}>
                    {teamPerformance.averages.responseTime.toFixed(1)} hours
                  </p>
                </div>
              </div>
            </div>

            <div className={adminStyles.stats.card}>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-500 text-white">
                  <HiOutlineThumbUp className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className={adminStyles.stats.title}>Client Satisfaction</h3>
                  <p className={adminStyles.stats.value}>
                    {teamPerformance.averages.clientSatisfaction.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Performance Trends */}
      <div className={adminStyles.card}>
        <h2 className={adminStyles.sectionHeader}>Performance Trends</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="period" 
                stroke={theme === 'dark' ? '#E5E7EB' : '#374151'}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#E5E7EB' : '#374151'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                  color: theme === 'dark' ? '#E5E7EB' : '#374151'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completionRate"
                name="Completion Rate"
                stroke={chartColors.completionRate}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                name="Response Time"
                stroke={chartColors.responseTime}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="clientSatisfaction"
                name="Client Satisfaction"
                stroke={chartColors.clientSatisfaction}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      {teamPerformance && (
        <div className={`${adminStyles.card} mt-6`}>
          <h2 className={adminStyles.sectionHeader}>Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['completionRate', 'responseTime', 'clientSatisfaction'].map((metric) => (
              <div key={metric} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {metric === 'completionRate' ? 'Completion Rate' :
                   metric === 'responseTime' ? 'Response Time' :
                   'Client Satisfaction'}
                </h3>
                {teamPerformance.topPerformers
                  .filter(p => p.metric === metric)
                  .map((performer, index) => (
                    <div
                      key={performer.coordinatorId}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {performer.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {metric === 'responseTime'
                              ? `${performer.value.toFixed(1)} hours`
                              : `${performer.value.toFixed(1)}%`}
                          </p>
                        </div>
                        <div className={`text-lg font-bold
                          ${index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-amber-600'}`}
                        >
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage; 