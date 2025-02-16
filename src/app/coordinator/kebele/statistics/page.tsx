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
      const response = await fetch('/api/coordinator/kebeles/statistics');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load statistics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
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
                {stats.totalPopulation.toLocaleString()}
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
                {stats.averagePopulation.toLocaleString()}
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