"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  HiOutlineDocumentReport,
  HiOutlineChartPie,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineUsers,
  HiOutlineDownload
} from 'react-icons/hi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ReportFilter {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: string;
}

interface ReportData {
  success: boolean;
  data: {
    caseMetrics: {
      total: number;
      resolved: number;
      pending: number;
      byCategory: { category: string; count: number }[];
    };
    userMetrics: {
      totalUsers: number;
      activeUsers: number;
      byRole: { userRole: string; count: number }[];
    };
    documentMetrics: {
      total: number;
      verified: number;
      pending: number;
      rejected: number;
    };
    performanceMetrics: {
      avgResolutionTime: number;
      satisfactionRate: number;
      completionRate: number;
    };
  };
}

function ReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />
        ))}
      </div>
    </div>
  );
}

export default function ReportsDashboard() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilter>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    type: 'monthly',
    category: 'all'
  });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/reports/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filter),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch report data');
      }
      
      setReportData(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load report data';
      setError(message);
      console.error('Error fetching report data:', error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [filter]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/admin/reports/export?format=${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filter),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${filter.type}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start && end) {
      setFilter(prev => ({
        ...prev,
        startDate: start,
        endDate: end
      }));
    }
  };

  if (loading) {
    return <ReportSkeleton />;
  }

  if (error || !reportData?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-red-500 mb-4 text-lg">{error || 'No data available'}</div>
        <button
          onClick={fetchReportData}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = reportData.data;

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <div className="flex gap-2">
              <DatePicker
                selected={filter.startDate}
                onChange={handleDateChange}
                startDate={filter.startDate}
                endDate={filter.endDate}
                selectsRange
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="civil">Civil Cases</option>
              <option value="criminal">Criminal Cases</option>
              <option value="family">Family Law</option>
              <option value="corporate">Corporate Law</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <HiOutlineDownload className="w-5 h-5 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <HiOutlineDownload className="w-5 h-5 mr-2" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Case Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <HiOutlineScale className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold">Case Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Cases</span>
              <span className="font-semibold">{metrics.caseMetrics.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Resolved Cases</span>
              <span className="font-semibold text-green-500">{metrics.caseMetrics.resolved}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Cases</span>
              <span className="font-semibold text-yellow-500">{metrics.caseMetrics.pending}</span>
            </div>
          </div>
        </div>

        {/* User Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <HiOutlineUsers className="w-6 h-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold">User Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Users</span>
              <span className="font-semibold">{metrics.userMetrics.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users</span>
              <span className="font-semibold">{metrics.userMetrics.activeUsers}</span>
            </div>
          </div>
        </div>

        {/* Document Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <HiOutlineDocumentText className="w-6 h-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold">Document Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Documents</span>
              <span className="font-semibold">{metrics.documentMetrics.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Verified</span>
              <span className="font-semibold text-green-500">{metrics.documentMetrics.verified}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-semibold text-yellow-500">{metrics.documentMetrics.pending}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <HiOutlineChartBar className="w-6 h-6 text-indigo-500 mr-2" />
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Avg. Resolution Time</span>
              <span className="font-semibold">{metrics.performanceMetrics.avgResolutionTime} days</span>
            </div>
            <div className="flex justify-between">
              <span>Satisfaction Rate</span>
              <span className="font-semibold">{metrics.performanceMetrics.satisfactionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Completion Rate</span>
              <span className="font-semibold">{metrics.performanceMetrics.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}