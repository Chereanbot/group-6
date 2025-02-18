"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Download, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface MonthlyStats {
  month: string;
  totalCases: number;
  newCases: number;
  resolvedCases: number;
  averageResolutionTime: number;
  totalBillableHours: number;
  revenue: number;
  byStatus: {
    active: number;
    pending: number;
    resolved: number;
    cancelled: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  performance: {
    resolutionRate: number;
    clientSatisfaction: number;
    efficiency: number;
  };
}

export default function MonthlyReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [comparisonStats, setComparisonStats] = useState<{
    prevMonth: MonthlyStats | null;
    trends: Record<string, number>;
  }>({
    prevMonth: null,
    trends: {}
  });

  const calculateTrends = (current: MonthlyStats, previous: MonthlyStats) => {
    return {
      totalCases: ((current.totalCases - previous.totalCases) / previous.totalCases) * 100,
      newCases: ((current.newCases - previous.newCases) / previous.newCases) * 100,
      resolvedCases: ((current.resolvedCases - previous.resolvedCases) / previous.resolvedCases) * 100,
      resolutionTime: ((current.averageResolutionTime - previous.averageResolutionTime) / previous.averageResolutionTime) * 100,
      billableHours: ((current.totalBillableHours - previous.totalBillableHours) / previous.totalBillableHours) * 100,
      revenue: ((current.revenue - previous.revenue) / previous.revenue) * 100
    };
  };

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      const startDate = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      const prevStartDate = startOfMonth(subMonths(startDate, 1));
      const prevEndDate = endOfMonth(subMonths(startDate, 1));

      const [currentStats, previousStats] = await Promise.all([
        fetch('/api/coordinator/reports/monthly', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        }).then(res => res.json()),
        fetch('/api/coordinator/reports/monthly', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: prevStartDate.toISOString(),
            endDate: prevEndDate.toISOString(),
          }),
        }).then(res => res.json())
      ]);

      if (currentStats.success && previousStats.success) {
        setMonthlyStats(currentStats.stats);
        setComparisonStats({
          prevMonth: previousStats.stats,
          trends: calculateTrends(currentStats.stats, previousStats.stats)
        });
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to fetch monthly statistics',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyStats();
  }, [selectedMonth]);

  const renderTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getLastSixMonths = () => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = subMonths(new Date(), i);
      months.push(format(date, 'yyyy-MM'));
    }
    return months;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading statistics...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Monthly Performance Report</h1>
        <Select
          value={selectedMonth}
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {getLastSixMonths().map((month) => (
              <SelectItem key={month} value={month}>
                {format(new Date(month), 'MMMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {monthlyStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{monthlyStats.totalCases}</div>
                  <div className="flex items-center">
                    {renderTrendIcon(comparisonStats.trends.totalCases)}
                    <span className="ml-1 text-sm">
                      {Math.abs(comparisonStats.trends.totalCases).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{monthlyStats.newCases}</div>
                  <div className="flex items-center">
                    {renderTrendIcon(comparisonStats.trends.newCases)}
                    <span className="ml-1 text-sm">
                      {Math.abs(comparisonStats.trends.newCases).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {monthlyStats.performance.resolutionRate.toFixed(1)}%
                  </div>
                  <Progress
                    value={monthlyStats.performance.resolutionRate}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    ${monthlyStats.revenue.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    {renderTrendIcon(comparisonStats.trends.revenue)}
                    <span className="ml-1 text-sm">
                      {Math.abs(comparisonStats.trends.revenue).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(monthlyStats.byStatus).map(([status, count]) => (
                    <div key={status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <span className="text-sm text-gray-600">{count}</span>
                      </div>
                      <Progress
                        value={(count / monthlyStats.totalCases) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Case Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyStats.topCategories.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell>{category.category}</TableCell>
                          <TableCell className="text-right">{category.count}</TableCell>
                          <TableCell className="text-right">
                            {((category.count / monthlyStats.totalCases) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Average Resolution Time</div>
                  <div className="text-2xl font-bold">
                    {monthlyStats.averageResolutionTime.toFixed(1)} days
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    {renderTrendIcon(comparisonStats.trends.resolutionTime)}
                    <span className="ml-1">
                      {Math.abs(comparisonStats.trends.resolutionTime).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Client Satisfaction</div>
                  <div className="text-2xl font-bold">
                    {monthlyStats.performance.clientSatisfaction.toFixed(1)}%
                  </div>
                  <Progress
                    value={monthlyStats.performance.clientSatisfaction}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Efficiency Score</div>
                  <div className="text-2xl font-bold">
                    {monthlyStats.performance.efficiency.toFixed(1)}%
                  </div>
                  <Progress
                    value={monthlyStats.performance.efficiency}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 