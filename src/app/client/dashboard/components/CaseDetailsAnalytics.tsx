import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineClock,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineUserGroup,
  HiOutlineArrowSmUp,
  HiOutlineArrowSmDown,
  HiOutlineDotsVertical
} from 'react-icons/hi';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CaseMetrics {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  pendingCases: number;
  casesByType: {
    type: string;
    count: number;
    trend: number;
  }[];
  caseTimeline: {
    date: string;
    count: number;
    resolved: number;
    pending: number;
  }[];
  averageResolutionTime: number;
  successRate: number;
  monthlyTrends: {
    month: string;
    newCases: number;
    resolvedCases: number;
    avgResolutionDays: number;
  }[];
  priorityDistribution: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  caseInsights: {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
  }[];
}

interface CaseDetailsAnalyticsProps {
  data: CaseMetrics;
  onFilterChange?: (filter: string) => void;
  onTimeRangeChange?: (range: string) => void;
}

export const CaseDetailsAnalytics = ({ data, onFilterChange, onTimeRangeChange }: CaseDetailsAnalyticsProps) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'distribution'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showInsights, setShowInsights] = useState(true);

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: 'Year' }
  ];

  const trendData = {
    labels: data.monthlyTrends.map(item => item.month),
    datasets: [
      {
        label: 'New Cases',
        data: data.monthlyTrends.map(item => item.newCases),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Resolved Cases',
        data: data.monthlyTrends.map(item => item.resolvedCases),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const priorityData = {
    labels: data.priorityDistribution.map(item => item.priority),
    datasets: [{
      data: data.priorityDistribution.map(item => item.count),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const caseTypeData = {
    labels: data.casesByType.map(item => item.type),
    datasets: [{
      label: 'Cases by Type',
      data: data.casesByType.map(item => item.count),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
    }]
  };

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    onTimeRangeChange?.(range);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div>
          <h2 className="text-xl font-semibold">Case Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Detailed insights and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          {timeRanges.map(range => (
            <button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTimeRange === range.value
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.caseInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{insight.title}</p>
                <p className="text-2xl font-semibold mt-1">{insight.value}</p>
              </div>
              <div className={`flex items-center ${
                insight.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {insight.trend === 'up' ? (
                  <HiOutlineArrowSmUp className="w-5 h-5" />
                ) : (
                  <HiOutlineArrowSmDown className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{Math.abs(insight.change)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Case Trends</h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <HiOutlineDotsVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[300px]">
            <Line
              data={trendData}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index' as const,
                  intersect: false,
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Distribution Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Case Distribution</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('distribution')}
                className={`p-2 rounded-lg transition-colors ${
                  selectedView === 'distribution'
                    ? 'bg-primary-100 text-primary-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <HiOutlineChartPie className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedView('trends')}
                className={`p-2 rounded-lg transition-colors ${
                  selectedView === 'trends'
                    ? 'bg-primary-100 text-primary-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <HiOutlineChartBar className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <AnimatePresence mode="wait">
              {selectedView === 'distribution' ? (
                <motion.div
                  key="pie"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Pie data={priorityData} />
                </motion.div>
              ) : (
                <motion.div
                  key="bar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Bar
                    data={caseTypeData}
                    options={{
                      responsive: true,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            display: false,
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resolution Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Resolution Time</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-primary-600">
                {Math.round(data.averageResolutionTime)}
                <span className="text-sm text-gray-500 ml-1">days</span>
              </p>
              <p className="text-sm text-gray-500">Average resolution time</p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
              <HiOutlineClock className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </motion.div>

        {/* Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Success Rate</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-green-600">
                {Math.round(data.successRate)}%
              </p>
              <p className="text-sm text-gray-500">Cases successfully resolved</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Case Load */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Current Case Load</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-blue-600">
                {data.activeCases}
                <span className="text-sm text-gray-500 ml-1">active</span>
              </p>
              <p className="text-sm text-gray-500">Out of {data.totalCases} total cases</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <HiOutlineScale className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}; 