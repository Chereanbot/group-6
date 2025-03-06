import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineClock,
  HiOutlineScale,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CaseAnalytics {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  pendingCases: number;
  casesByType: {
    type: string;
    count: number;
  }[];
  caseTimeline: {
    date: string;
    count: number;
  }[];
  averageResolutionTime: number;
  successRate: number;
}

interface CaseAnalyticsProps {
  data: CaseAnalytics;
}

export const CaseAnalytics = ({ data }: CaseAnalyticsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'timeline' | 'distribution'>('timeline');

  const timelineData = {
    labels: data.caseTimeline.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Cases',
        data: data.caseTimeline.map(item => item.count),
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const timelineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
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
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const distributionData = {
    labels: data.casesByType.map(item => item.type),
    datasets: [
      {
        data: data.casesByType.map(item => item.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const distributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const stats = [
    {
      label: 'Total Cases',
      value: data.totalCases,
      icon: HiOutlineDocumentText,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      label: 'Active Cases',
      value: data.activeCases,
      icon: HiOutlineScale,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Success Rate',
      value: `${Math.round(data.successRate)}%`,
      icon: HiOutlineCheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Avg. Resolution',
      value: `${Math.round(data.averageResolutionTime)} days`,
      icon: HiOutlineClock,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Case Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedMetric('timeline')}
            className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'timeline'
                ? 'bg-primary-100 text-primary-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <HiOutlineChartBar className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedMetric('distribution')}
            className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'distribution'
                ? 'bg-primary-100 text-primary-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <HiOutlineChartPie className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
          >
            <div className={`p-2 rounded-lg ${stat.color} w-fit mb-2`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-semibold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-[300px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: selectedMetric === 'timeline' ? 'block' : 'none' }}
        >
          <Line data={timelineData} options={timelineOptions} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: selectedMetric === 'distribution' ? 'block' : 'none' }}
        >
          <Pie data={distributionData} options={distributionOptions} />
        </motion.div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Case Status</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last 30 days
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
              <span>Resolved</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{data.resolvedCases}</span>
              <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.resolvedCases / data.totalCases) * 100}%` }}
                  className="h-full rounded-full bg-green-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HiOutlineScale className="w-5 h-5 text-blue-500" />
              <span>Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{data.activeCases}</span>
              <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.activeCases / data.totalCases) * 100}%` }}
                  className="h-full rounded-full bg-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HiOutlineExclamationCircle className="w-5 h-5 text-yellow-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{data.pendingCases}</span>
              <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.pendingCases / data.totalCases) * 100}%` }}
                  className="h-full rounded-full bg-yellow-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 