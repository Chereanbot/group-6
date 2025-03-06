"use client";

import { useState, useEffect } from 'react';
import { HiOutlineOfficeBuilding, HiOutlineUsers, HiOutlineDocumentText, HiOutlineScale } from 'react-icons/hi';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface KebeleStats {
  totalKebeles: number;
  totalPopulation: number;
  averagePopulation: number;
  totalCases: number;
  populationByDistrict: {
    district: string;
    population: number;
  }[];
  casesByType: {
    type: string;
    count: number;
  }[];
  serviceDistribution: {
    service: string;
    count: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function KebeleStatistics() {
  const [stats, setStats] = useState<KebeleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/coordinator/kebeles/statistics');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Kebele Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Loading statistics...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Error Loading Statistics</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={fetchStatistics}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Kebele Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analytics and insights about kebele operations
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <HiOutlineOfficeBuilding className="w-8 h-8 text-primary-500" />
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.totalKebeles}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">Total Kebeles</h3>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <HiOutlineUsers className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {(stats?.totalPopulation || 0).toLocaleString()}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">Total Population</h3>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <HiOutlineScale className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {(stats?.averagePopulation || 0).toLocaleString()}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">Average Population</h3>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <HiOutlineDocumentText className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.totalCases}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400">Total Cases</h3>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Population by District Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Population by District
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.populationByDistrict}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="district" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="population" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cases by Type Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Cases by Type
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.casesByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.casesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Service Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 lg:col-span-2"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Service Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.serviceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82CA9D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 