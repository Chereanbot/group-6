"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineDownload,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineCheck,
} from 'react-icons/hi';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface ReportData {
  overview: {
    totalCases: number;
    totalClients: number;
    averageResolutionTime: number;
    successRate: number;
  };
  casesByStatus: Array<{
    status: string;
    _count: number;
  }>;
  recentCases: Array<{
    id: string;
    title: string;
    status: string;
    client: string;
    assignedTo: string;
    createdAt: string;
  }>;
  monthlyStats: Array<{
    month: string;
    newCases: number;
    resolvedCases: number;
  }>;
  performanceMetrics: {
    averageResolutionTime: number;
    successRate: number;
    totalCasesHandled: number;
    completedCases: number;
  };
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/coordinator/reports?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch report data');
      }
      setReportData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: reportData?.monthlyStats?.map(stat => stat.month) || [],
    datasets: [
      {
        label: 'New Cases',
        data: reportData?.monthlyStats?.map(stat => stat.newCases) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Resolved Cases',
        data: reportData?.monthlyStats?.map(stat => stat.resolvedCases) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Case Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const reportCategories = [
    {
      title: 'Total Cases',
      icon: HiOutlineScale,
      stats: { 
        total: reportData?.overview?.totalCases?.toString() || '0',
        change: reportData?.casesByStatus?.reduce((acc, curr) => {
          if (curr.status === 'ACTIVE') return `${curr.count} Active`;
          return acc;
        }, 'No active cases')
      },
      color: 'from-blue-500 to-blue-600',
      description: 'Total number of cases handled'
    },
    {
      title: 'Total Clients',
      icon: HiOutlineUserGroup,
      stats: { 
        total: reportData?.overview?.totalClients?.toString() || '0',
        change: 'Active Clients'
      },
      color: 'from-purple-500 to-purple-600',
      description: 'Number of clients served'
    },
    {
      title: 'Success Rate',
      icon: HiOutlineCheck,
      stats: { 
        total: `${Math.round(reportData?.overview?.successRate || 0)}%`,
        change: `${reportData?.casesByStatus?.find(s => s.status === 'RESOLVED')?.count || 0} Resolved`
      },
      color: 'from-green-500 to-green-600',
      description: 'Case resolution success rate'
    },
    {
      title: 'Avg. Resolution Time',
      icon: HiOutlineClock,
      stats: { 
        total: `${Math.round(reportData?.overview?.averageResolutionTime || 0)} days`,
        change: `${reportData?.performanceMetrics?.completedCases || 0} Completed`
      },
      color: 'from-orange-500 to-orange-600',
      description: 'Average time to resolve cases'
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchReportData}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reports Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights and analytics for your legal aid center
          </p>
        </motion.div>

        {/* Controls Section */}
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <Tooltip.Provider>
            <div className="relative">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setSelectedPeriod(prev => 
                      prev === 'month' ? 'year' : prev === 'year' ? 'quarter' : 'month'
                    )}
                    className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm
                      hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300"
                  >
                    <HiOutlineCalendar className="w-5 h-5 mr-2" />
                    {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm animate-in fade-in-0 zoom-in-95"
                    sideOffset={5}
                  >
                    Change time period
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>

            <div className="ml-auto">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => {
                      // Implement export functionality
                      alert('Export functionality will be implemented');
                    }}
                    className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 
                      text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <HiOutlineDownload className="w-5 h-5 mr-2" />
                    Export Reports
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm animate-in fade-in-0 zoom-in-95"
                    sideOffset={5}
                  >
                    Export reports as PDF/Excel
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </Tooltip.Provider>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg 
                transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${category.color} 
                  text-white mb-4 shadow-lg`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.stats.total}
                  </div>
                  <div className="text-sm font-medium text-green-500">
                    {category.stats.change}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart Section */}
        {reportData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        )}

        {/* Recent Cases Section */}
        {reportData?.recentCases && reportData.recentCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Cases
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Case Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.recentCases.map((caseItem, index) => (
                    <motion.tr
                      key={caseItem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {caseItem.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {caseItem.client}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {caseItem.assignedTo}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full
                          ${caseItem.status === 'RESOLVED' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                          {caseItem.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 