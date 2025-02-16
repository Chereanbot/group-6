"use client";

import { useState, useEffect } from 'react';
import { PerformanceService } from '@/services/coordinator/PerformanceService';
import { 
  CoordinatorPerformance, 
  PerformanceMetric,
  PerformanceFilter 
} from '@/types/coordinator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PerformancePage = () => {
  const [performanceData, setPerformanceData] = useState<CoordinatorPerformance[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<{
    averages: Record<PerformanceMetric, number>;
    topPerformers: Array<{
      coordinatorId: string;
      metric: PerformanceMetric;
      value: number;
    }>;
  }>();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PerformanceFilter>({});

  const service = new PerformanceService();

  useEffect(() => {
    loadPerformanceData();
    loadTeamPerformance();
  }, [filters]);

  const loadPerformanceData = async () => {
    try {
      const data = await service.getPerformanceData(filters);
      setPerformanceData(data);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  const loadTeamPerformance = async () => {
    try {
      const data = await service.getTeamPerformance();
      setTeamPerformance(data);
    } catch (error) {
      console.error('Failed to load team performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const period = 'last-month'; // or get from user input
      const blob = await service.generatePerformanceReport('all', period);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${period}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Performance Metrics</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Export Report
        </button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {teamPerformance && Object.entries(teamPerformance.averages).map(([metric, value]) => (
          <div key={metric} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{metric}</h3>
            <p className="text-2xl font-bold">{value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Performance Trends</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.values(PerformanceMetric).map((metric) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamPerformance?.topPerformers.map((performer) => (
            <div key={`${performer.coordinatorId}-${performer.metric}`} className="p-4 border rounded-lg">
              <h3 className="font-medium">{performer.metric}</h3>
              <p className="text-lg">{performer.value.toFixed(2)}</p>
              {/* Add coordinator name here */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformancePage; 