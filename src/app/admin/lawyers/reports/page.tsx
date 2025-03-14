"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ScaleIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LawyerReport {
  id: string;
  fullName: string;
  email: string;
  status: string;
  metrics: {
    totalCases: number;
    resolvedCases: number;
    pendingCases: number;
    successRate: number;
    averageResolutionTime: number;
    clientSatisfaction: number;
    workloadScore: number;
    performanceScore: number;
  };
  trends: {
    monthly: {
      month: string;
      caseCount: number;
      resolutionRate: number;
    }[];
    performance: {
      period: string;
      score: number;
    }[];
  };
  specializations: {
    name: string;
    caseCount: number;
    successRate: number;
  }[];
}

interface ReportFilters {
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  office: string;
  specialization: string;
  performanceThreshold: string;
}

export default function LawyerReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<LawyerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'monthly',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    office: 'all',
    specialization: 'all',
    performanceThreshold: '0'
  });

  const [offices, setOffices] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [aggregateStats, setAggregateStats] = useState({
    totalCases: 0,
    averageResolutionTime: 0,
    overallSuccessRate: 0,
    averageClientSatisfaction: 0,
    topPerformers: 0,
    needsImprovement: 0
  });

  const loadReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this page');
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams({
        ...filters,
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      const response = await fetch(`/api/lawyers/reports?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      if (data.success) {
        setReports(data.data.reports);
        setAggregateStats(data.data.aggregateStats);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const [officesRes, specializationsRes] = await Promise.all([
        fetch('/api/offices', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/specializations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (officesRes.ok) {
        const officeData = await officesRes.json();
        setOffices(officeData.data.map((o: any) => o.name));
      }

      if (specializationsRes.ok) {
        const specData = await specializationsRes.json();
        setSpecializations(specData.data.map((s: any) => s.name));
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  useEffect(() => {
    loadFilterOptions();
    loadReports();
  }, []);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/lawyers/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filters)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lawyer-reports-${filters.period}-${filters.startDate}-${filters.endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting reports:', error);
      toast.error('Failed to export reports');
    }
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadReports();
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Lawyer Performance Reports</h1>
          <p className="text-gray-500">Comprehensive analysis and metrics of lawyer performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <DocumentChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateStats.totalCases}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateStats.overallSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">case resolution rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateStats.averageResolutionTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">average resolution time</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={filters.period}
          onValueChange={(value) => handleFilterChange('period', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="w-[200px]"
        />

        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="w-[200px]"
        />

        <Select
          value={filters.office}
          onValueChange={(value) => handleFilterChange('office', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {offices.map((office) => (
              <SelectItem key={office} value={office}>{office}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.specialization}
          onValueChange={(value) => handleFilterChange('specialization', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lawyer</TableHead>
              <TableHead>Cases</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Avg. Resolution Time</TableHead>
              <TableHead>Client Satisfaction</TableHead>
              <TableHead>Performance Score</TableHead>
              <TableHead>Specialization Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No reports found for the selected criteria
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.fullName}</div>
                      <div className="text-sm text-muted-foreground">{report.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{report.metrics.totalCases} total</div>
                      <div className="text-sm">
                        <span className="text-green-600">{report.metrics.resolvedCases} resolved</span>
                        {' • '}
                        <span className="text-yellow-600">{report.metrics.pendingCases} pending</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPerformanceColor(report.metrics.successRate)}>
                      {report.metrics.successRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.metrics.averageResolutionTime.toFixed(1)} days
                  </TableCell>
                  <TableCell>
                    <Badge className={getPerformanceColor(report.metrics.clientSatisfaction * 20)}>
                      {report.metrics.clientSatisfaction.toFixed(1)}/5.0
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPerformanceColor(report.metrics.performanceScore)}>
                      {report.metrics.performanceScore.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {report.specializations.map((spec, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{spec.name}:</span>
                          {' '}
                          <Badge className={getPerformanceColor(spec.successRate)}>
                            {spec.successRate.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 