'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceStatsGrid } from '@/components/ui/performance-stats';
import { PerformanceChart } from '@/components/ui/performance-chart';
import { useRouter } from 'next/navigation';

interface OfficePerformance {
  id: string;
  office: {
    id: string;
    name: string;
    location: string;
  };
  category: 'CASE_RESOLUTION' | 'RESPONSE_TIME' | 'CLIENT_SATISFACTION' | 'RESOURCE_UTILIZATION' | 'STAFF_EFFICIENCY' | 'FINANCIAL';
  metric: string;
  value: number;
  period: string;
  targetValue: number | null;
  description: string | null;
  date: string;
  createdAt: string;
}

interface AutoCalculatedMetrics {
  caseResolution: {
    totalCases: number;
    resolvedCases: number;
    resolutionRate: number;
  };
  responseTime: {
    averageResponseTime: number;
    responseWithin24h: number;
  };
  clientSatisfaction: {
    averageRating: number;
    totalReviews: number;
  };
  staffEfficiency: {
    casesPerStaff: number;
    averageHandlingTime: number;
  };
  financial: {
    revenue: number;
    expenses: number;
    profitMargin: number;
  };
}

interface Option {
  id: string;
  name: string;
}

// Sample data for charts
const caseData = [
  { name: 'Jan', cases: 65 },
  { name: 'Feb', cases: 78 },
  { name: 'Mar', cases: 90 },
  { name: 'Apr', cases: 85 },
  { name: 'May', cases: 95 },
  { name: 'Jun', cases: 88 },
];

const clientData = [
  { name: 'Jan', satisfaction: 85 },
  { name: 'Feb', satisfaction: 88 },
  { name: 'Mar', satisfaction: 92 },
  { name: 'Apr', satisfaction: 90 },
  { name: 'May', satisfaction: 94 },
  { name: 'Jun', satisfaction: 92 },
];

const lawyerData = [
  { name: 'Jan', efficiency: 75 },
  { name: 'Feb', efficiency: 82 },
  { name: 'Mar', efficiency: 85 },
  { name: 'Apr', efficiency: 88 },
  { name: 'May', efficiency: 90 },
  { name: 'Jun', efficiency: 92 },
];

export default function OfficePerformancePage() {
  const router = useRouter();
  const [performances, setPerformances] = useState<OfficePerformance[]>([]);
  const [autoMetrics, setAutoMetrics] = useState<AutoCalculatedMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      toast.error('Please log in to access this page');
      router.push('/auth/login');
      return;
    }
    fetchAutoCalculatedMetrics();
  }, [router]);

  const fetchAutoCalculatedMetrics = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/offices/metrics/auto-calculated', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setAutoMetrics(data.data);
        // Transform auto-calculated metrics into performance format
        const transformedPerformances = transformMetricsToPerformances(data.data);
        setPerformances(transformedPerformances);
      } else {
        if (response.status === 401) {
          toast.error('Please log in to access this page');
          router.push('/auth/login');
          return;
        }
        toast.error('Failed to fetch metrics');
      }
    } catch (error) {
      toast.error('Error fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  const transformMetricsToPerformances = (metrics: AutoCalculatedMetrics): OfficePerformance[] => {
    const currentDate = new Date().toISOString().split('T')[0];
    const performances: OfficePerformance[] = [];

    // Case Resolution Metrics
    performances.push({
      id: 'case-resolution',
      office: { id: '1', name: 'Main Office', location: 'Main' },
      category: 'CASE_RESOLUTION',
      metric: 'Resolution Rate',
      value: metrics.caseResolution.resolutionRate,
      period: currentDate,
      targetValue: 90, // Target can be configured
      description: `${metrics.caseResolution.resolvedCases} out of ${metrics.caseResolution.totalCases} cases resolved`,
      date: currentDate,
      createdAt: new Date().toISOString()
    });

    // Response Time Metrics
    performances.push({
      id: 'response-time',
      office: { id: '1', name: 'Main Office', location: 'Main' },
      category: 'RESPONSE_TIME',
      metric: 'Average Response Time',
      value: metrics.responseTime.averageResponseTime,
      period: currentDate,
      targetValue: 24, // 24 hours target
      description: `${metrics.responseTime.responseWithin24h}% responses within 24h`,
      date: currentDate,
      createdAt: new Date().toISOString()
    });

    // Client Satisfaction Metrics
    performances.push({
      id: 'client-satisfaction',
      office: { id: '1', name: 'Main Office', location: 'Main' },
      category: 'CLIENT_SATISFACTION',
      metric: 'Average Rating',
      value: metrics.clientSatisfaction.averageRating,
      period: currentDate,
      targetValue: 4.5,
      description: `Based on ${metrics.clientSatisfaction.totalReviews} reviews`,
      date: currentDate,
      createdAt: new Date().toISOString()
    });

    // Staff Efficiency Metrics
    performances.push({
      id: 'staff-efficiency',
      office: { id: '1', name: 'Main Office', location: 'Main' },
      category: 'STAFF_EFFICIENCY',
      metric: 'Cases Per Staff',
      value: metrics.staffEfficiency.casesPerStaff,
      period: currentDate,
      targetValue: 20,
      description: `Average handling time: ${metrics.staffEfficiency.averageHandlingTime} hours`,
      date: currentDate,
      createdAt: new Date().toISOString()
    });

    // Financial Metrics
    performances.push({
      id: 'financial',
      office: { id: '1', name: 'Main Office', location: 'Main' },
      category: 'FINANCIAL',
      metric: 'Profit Margin',
      value: metrics.financial.profitMargin,
      period: currentDate,
      targetValue: 30,
      description: `Revenue: $${metrics.financial.revenue}, Expenses: $${metrics.financial.expenses}`,
      date: currentDate,
      createdAt: new Date().toISOString()
    });

    return performances;
  };

  // Function to calculate performance stats from API data
  const calculatePerformanceStats = (performances: OfficePerformance[]) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDate = lastMonth.toISOString().split('T')[0];

    const currentPeriod = performances.filter(p => p.period === currentDate);
    const lastPeriod = performances.filter(p => p.period === lastMonthDate);

    const calculateChange = (current: number, previous: number) => {
      if (!previous) return 0;
      return ((current - previous) / previous) * 100;
    };

    const totalCases = currentPeriod.reduce((sum, p) => sum + (p.value || 0), 0);
    const prevTotalCases = lastPeriod.reduce((sum, p) => sum + (p.value || 0), 0);

    return {
      totalCases,
      totalCasesChange: calculateChange(totalCases, prevTotalCases),
      clientSatisfaction: 92, // You'll need to calculate these from real data
      clientSatisfactionChange: 5.2,
      resolutionRate: 78,
      resolutionRateChange: -2.1,
      responseTime: 24,
      responseTimeChange: -8.3
    };
  };

  // Function to transform data for charts
  const transformChartData = (performances: OfficePerformance[], category: OfficePerformance['category']) => {
    const monthlyData = performances
      .filter(p => p.category === category)
      .reduce((acc, curr) => {
        const month = new Date(curr.period).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { total: 0, count: 0 };
        }
        acc[month].total += curr.value || 0;
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(monthlyData).map(([name, data]) => ({
      name,
      value: data.total / data.count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Office Performance</h1>
        <Button 
          onClick={fetchAutoCalculatedMetrics}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Refresh Metrics'
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {performances.length > 0 ? (
            <>
              <PerformanceStatsGrid data={calculatePerformanceStats(performances)} />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <PerformanceChart
                  title="Case Resolution Trend"
                  data={transformChartData(performances, 'CASE_RESOLUTION')}
                  dataKey="value"
                  color="#8884d8"
                  yAxisLabel="Cases"
                  tooltipFormatter={(value) => `${value} cases`}
                />
                <PerformanceChart
                  title="Client Satisfaction Trend"
                  data={transformChartData(performances, 'CLIENT_SATISFACTION')}
                  dataKey="value"
                  color="#82ca9d"
                  yAxisLabel="Satisfaction"
                  tooltipFormatter={(value) => `${value}%`}
                />
              </div>
            </>
          ) : (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No performance data available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {performances.filter(p => p.category === 'CASE_RESOLUTION').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Office</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performances
                      .filter(p => p.category === 'CASE_RESOLUTION')
                      .map((performance) => (
                        <TableRow key={performance.id}>
                          <TableCell>{performance.office.name}</TableCell>
                          <TableCell>{performance.metric}</TableCell>
                          <TableCell>{performance.value}</TableCell>
                          <TableCell>{performance.targetValue || '-'}</TableCell>
                          <TableCell>{new Date(performance.period).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No case performance data found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {performances.filter(p => p.category === 'CLIENT_SATISFACTION').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Office</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performances
                      .filter(p => p.category === 'CLIENT_SATISFACTION')
                      .map((performance) => (
                        <TableRow key={performance.id}>
                          <TableCell>{performance.office.name}</TableCell>
                          <TableCell>{performance.metric}</TableCell>
                          <TableCell>{performance.value}</TableCell>
                          <TableCell>{performance.targetValue || '-'}</TableCell>
                          <TableCell>{new Date(performance.period).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No client performance data found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {performances.filter(p => p.category === 'STAFF_EFFICIENCY').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Office</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performances
                      .filter(p => p.category === 'STAFF_EFFICIENCY')
                      .map((performance) => (
                        <TableRow key={performance.id}>
                          <TableCell>{performance.office.name}</TableCell>
                          <TableCell>{performance.metric}</TableCell>
                          <TableCell>{performance.value}</TableCell>
                          <TableCell>{performance.targetValue || '-'}</TableCell>
                          <TableCell>{new Date(performance.period).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No staff performance data found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {performances.filter(p => p.category === 'FINANCIAL').length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Office</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performances
                      .filter(p => p.category === 'FINANCIAL')
                      .map((performance) => (
                        <TableRow key={performance.id}>
                          <TableCell>{performance.office.name}</TableCell>
                          <TableCell>{performance.metric}</TableCell>
                          <TableCell>{performance.value}</TableCell>
                          <TableCell>{performance.targetValue || '-'}</TableCell>
                          <TableCell>{new Date(performance.period).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">No financial performance data found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 