"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineCalendar
} from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  approvedCases: number;
  rejectedCases: number;
  totalResidents: number;
  casesByMonth: {
    month: string;
    pending: number;
    approved: number;
    rejected: number;
  }[];
  recentActivities: {
    id: string;
    type: string;
    title: string;
    status: string;
    timestamp: string;
    user: string;
  }[];
  populationTrend: {
    month: string;
    count: number;
  }[];
}

const mockData: DashboardStats = {
  totalCases: 256,
  pendingCases: 45,
  approvedCases: 189,
  rejectedCases: 22,
  totalResidents: 12543,
  casesByMonth: [
    { month: 'Jan', pending: 30, approved: 45, rejected: 5 },
    { month: 'Feb', pending: 25, approved: 50, rejected: 8 },
    { month: 'Mar', pending: 40, approved: 55, rejected: 4 },
    { month: 'Apr', pending: 35, approved: 48, rejected: 6 },
    { month: 'May', pending: 45, approved: 60, rejected: 7 },
    { month: 'Jun', pending: 38, approved: 52, rejected: 5 }
  ],
  recentActivities: [
    { id: '1', type: 'case', title: 'Birth Certificate Request', status: 'approved', timestamp: '2 hours ago', user: 'John Doe' },
    { id: '2', type: 'resident', title: 'New Resident Registration', status: 'completed', timestamp: '3 hours ago', user: 'Jane Smith' },
    { id: '3', type: 'case', title: 'ID Card Renewal', status: 'pending', timestamp: '5 hours ago', user: 'Mike Johnson' },
    { id: '4', type: 'case', title: 'Marriage Certificate', status: 'rejected', timestamp: '6 hours ago', user: 'Sarah Wilson' }
  ],
  populationTrend: [
    { month: 'Jan', count: 12100 },
    { month: 'Feb', count: 12250 },
    { month: 'Mar', count: 12320 },
    { month: 'Apr', count: 12400 },
    { month: 'May', count: 12480 },
    { month: 'Jun', count: 12543 }
  ]
};

export default function KebeleManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats>(mockData);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Overview
        </h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <HiOutlineCalendar className="h-5 w-5" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cases</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalCases}
              </h3>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
              <HiOutlineDocumentText className="h-6 w-6 text-primary-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <HiOutlineTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">12% increase</span>
            <span className="text-gray-400 dark:text-gray-500 ml-2">from last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Cases</p>
              <h3 className="text-2xl font-bold text-yellow-500 mt-1">
                {stats.pendingCases}
              </h3>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <HiOutlineClock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-500">{((stats.pendingCases / stats.totalCases) * 100).toFixed(1)}%</span>
            <span className="text-gray-400 dark:text-gray-500 ml-2">of total cases</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved Cases</p>
              <h3 className="text-2xl font-bold text-green-500 mt-1">
                {stats.approvedCases}
              </h3>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <HiOutlineCheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500">{((stats.approvedCases / stats.totalCases) * 100).toFixed(1)}%</span>
            <span className="text-gray-400 dark:text-gray-500 ml-2">approval rate</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected Cases</p>
              <h3 className="text-2xl font-bold text-red-500 mt-1">
                {stats.rejectedCases}
              </h3>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <HiOutlineXCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500">{((stats.rejectedCases / stats.totalCases) * 100).toFixed(1)}%</span>
            <span className="text-gray-400 dark:text-gray-500 ml-2">rejection rate</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Residents</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalResidents.toLocaleString()}
              </h3>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
              <HiOutlineUsers className="h-6 w-6 text-primary-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <HiOutlineTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">63 new</span>
            <span className="text-gray-400 dark:text-gray-500 ml-2">this month</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Case Statistics
            </h3>
            <HiOutlineChartBar className="h-6 w-6 text-primary-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.casesByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pending" fill="#EAB308" />
                <Bar dataKey="approved" fill="#22C55E" />
                <Bar dataKey="rejected" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Population Growth
            </h3>
            <HiOutlineTrendingUp className="h-6 w-6 text-primary-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.populationTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activities
          </h3>
          <button className="text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {stats.recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg 
                  ${activity.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20 text-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500' :
                    activity.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20 text-red-500' :
                    'bg-primary-100 dark:bg-primary-900/20 text-primary-500'
                  }`}
                >
                  {activity.type === 'case' ? (
                    <HiOutlineDocumentText className="h-5 w-5" />
                  ) : (
                    <HiOutlineUsers className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {activity.user}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${activity.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20 text-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500' :
                    activity.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/20 text-red-500' :
                    'bg-primary-100 dark:bg-primary-900/20 text-primary-500'
                  }`}
                >
                  {activity.status}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 