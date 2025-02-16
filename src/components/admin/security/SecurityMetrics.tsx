"use client";

import { useState, useEffect } from 'react';
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

interface MetricData {
  timestamp: string;
  loginAttempts: number;
  failedLogins: number;
  suspiciousActivities: number;
}

export default function SecurityMetrics() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [data, setData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetricsData();
  }, [timeframe]);

  const loadMetricsData = async () => {
    try {
      const response = await fetch(`/api/admin/security/metrics?timeframe=${timeframe}`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Metrics</h3>
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as any)}
              className={`px-3 py-1 rounded ${
                timeframe === tf
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              scale="time" 
              type="number" 
              domain={['auto', 'auto']}
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="loginAttempts" 
              stroke="#4F46E5" 
              name="Login Attempts"
            />
            <Line 
              type="monotone" 
              dataKey="failedLogins" 
              stroke="#EF4444" 
              name="Failed Logins"
            />
            <Line 
              type="monotone" 
              dataKey="suspiciousActivities" 
              stroke="#F59E0B" 
              name="Suspicious Activities"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 