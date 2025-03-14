'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface CaseAnalytics {
  monthlyData: {
    month: string;
    totalCases: number;
    completedCases: number;
    pendingCases: number;
    activeCases: number;
  }[];
  complexityDistribution: Record<string, number>;
  serviceTypes: Record<string, number>;
  categoryDistribution: Record<string, number>;
  activityTrends: Record<string, number>;
  totalCases: number;
  activeCases: number;
  completedCases: number;
  pendingCases: number;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C43'
];

export function CaseAnalyticsCharts() {
  const [analytics, setAnalytics] = useState<CaseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/lawyer/case-analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  // Transform data for pie charts
  const complexityData = Object.entries(analytics.complexityDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const serviceTypeData = Object.entries(analytics.serviceTypes).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  const categoryData = Object.entries(analytics.categoryDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const activityData = Object.entries(analytics.activityTrends).map(([date, count]) => ({
    date,
    count
  }));

  return (
    <div className="space-y-6">
      {/* Monthly Case Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Case Trends</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalCases" stroke="#8884d8" name="Total Cases" />
              <Line type="monotone" dataKey="completedCases" stroke="#82ca9d" name="Completed" />
              <Line type="monotone" dataKey="pendingCases" stroke="#ffc658" name="Pending" />
              <Line type="monotone" dataKey="activeCases" stroke="#ff7c43" name="Active" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Case Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Complexity Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Case Complexity Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complexityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {complexityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Service Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Service Type Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {serviceTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Case Category Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Case Category Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Activity Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
} 