"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const caseData = [
  { month: 'Jan', active: 65, completed: 45, pending: 20 },
  { month: 'Feb', active: 75, completed: 55, pending: 18 },
  { month: 'Mar', active: 85, completed: 60, pending: 22 },
  { month: 'Apr', active: 78, completed: 50, pending: 28 },
  { month: 'May', active: 90, completed: 65, pending: 25 },
  { month: 'Jun', active: 95, completed: 70, pending: 20 },
];

const revenueData = [
  { month: 'Jan', revenue: 35000 },
  { month: 'Feb', revenue: 42000 },
  { month: 'Mar', revenue: 38000 },
  { month: 'Apr', revenue: 45000 },
  { month: 'May', revenue: 52000 },
  { month: 'Jun', revenue: 48000 },
];

export const CaseStatistics = () => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={caseData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend />
        <Bar dataKey="active" fill="#3B82F6" name="Active Cases" />
        <Bar dataKey="completed" fill="#10B981" name="Completed" />
        <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const RevenueChart = () => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#3B82F6" 
          fill="#3B82F6" 
          fillOpacity={0.2}
          name="Monthly Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
); 