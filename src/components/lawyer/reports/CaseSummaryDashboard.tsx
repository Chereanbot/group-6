"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowUpDown,
  Download,
  FileText,
  Star,
  Clock,
  DollarSign,
  Activity,
} from "lucide-react";
import { format as dateFormat } from "date-fns";
import * as XLSX from 'xlsx';
import { ExportMenu } from "@/components/ui/export-menu";
import { exportToExcel, exportToPDF, exportToPNG, exportToCSV, ExportFormat } from "@/lib/export-utils";

interface CaseSummaryData {
  summary: {
    totalCases: number;
    activeCases: number;
    resolvedCases: number;
    totalBillable: number;
    averageComplexity: number;
  };
  cases: {
    id: string;
    title: string;
    status: string;
    category: string;
    priority: string;
    createdAt: string;
    resolvedAt: string | null;
    client: {
      name: string;
      email: string;
    };
    duration: number;
    complexity: number;
    billing: {
      totalBillable: number;
      totalHours: number;
    };
    metrics: {
      documentCount: number;
      activityCount: number;
      averageRating: number;
    };
    recentActivities: {
      id: string;
      title: string;
      description: string;
      date: string;
    }[];
    documents: {
      id: string;
      title: string;
      type: string;
      date: string;
    }[];
  }[];
}

export default function CaseSummaryDashboard() {
  const [data, setData] = useState<CaseSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/lawyer/reports/case-summary");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch case summary data");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching case summary data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = async (format: ExportFormat) => {
    if (!data) return;

    const currentDate = dateFormat(new Date(), 'yyyy-MM-dd');
    const filename = `case-summary-report-${currentDate}`;
    const exportData = {
      Summary: [{
        totalCases: data.summary.totalCases,
        activeCases: data.summary.activeCases,
        resolvedCases: data.summary.resolvedCases,
        totalBillable: data.summary.totalBillable,
        averageComplexity: data.summary.averageComplexity.toFixed(1),
      }],
      Cases: data.cases.map(c => ({
        title: c.title,
        status: c.status,
        category: c.category,
        priority: c.priority,
        client: c.client.name,
        email: c.client.email,
        createdAt: dateFormat(new Date(c.createdAt), 'yyyy-MM-dd'),
        resolvedAt: c.resolvedAt ? dateFormat(new Date(c.resolvedAt), 'yyyy-MM-dd') : 'N/A',
        duration: `${c.duration} days`,
        complexity: c.complexity,
        totalBillable: c.billing.totalBillable,
        totalHours: c.billing.totalHours,
        documentCount: c.metrics.documentCount,
        activityCount: c.metrics.activityCount,
        averageRating: c.metrics.averageRating,
      })),
      Activities: data.cases.flatMap(c => 
        c.recentActivities.map(a => ({
          case: c.title,
          activity: a.title,
          description: a.description,
          date: dateFormat(new Date(a.date), 'yyyy-MM-dd HH:mm'),
        }))
      ),
      Documents: data.cases.flatMap(c =>
        c.documents.map(d => ({
          case: c.title,
          document: d.title,
          type: d.type,
          date: dateFormat(new Date(d.date), 'yyyy-MM-dd'),
        }))
      ),
    };

    try {
      switch (format) {
        case 'xlsx':
          await exportToExcel(exportData, filename);
          break;
        case 'pdf':
          await exportToPDF('case-summary-dashboard', filename);
          break;
        case 'png':
          await exportToPNG('case-summary-dashboard', filename);
          break;
        case 'csv':
          // For CSV, we'll use the Cases data as it's the most comprehensive
          exportToCSV(exportData.Cases, filename);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show a toast notification here
    }
  };

  const sortCases = (field: string) => {
    if (!data) return;

    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sortedCases = [...data.cases].sort((a, b) => {
      let valueA = field.split('.').reduce((obj, key) => obj[key], a);
      let valueB = field.split('.').reduce((obj, key) => obj[key], b);

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (newDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setData({ ...data, cases: sortedCases });
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p className="text-lg font-medium">Error: {error}</p>
        </div>
        <p className="text-center mt-2 text-sm text-muted-foreground">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </Card>
    );
  }

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div id="case-summary-dashboard" className="space-y-8">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Case Summary Dashboard</h2>
        <ExportMenu onExport={handleExport} disabled={!data} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.activeCases}</div>
            <Progress 
              value={(data.summary.activeCases / data.summary.totalCases) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.resolvedCases}</div>
            <Progress 
              value={(data.summary.resolvedCases / data.summary.totalCases) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billable</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.summary.totalBillable.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Complexity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.averageComplexity.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Case Details</CardTitle>
              <CardDescription>Comprehensive view of all cases</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortCases('title')}
                  >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortCases('status')}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortCases('client.name')}
                  >
                    Client
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortCases('duration')}
                  >
                    Duration
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortCases('billing.totalBillable')}
                  >
                    Billable
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => sortCases('metrics.averageRating')}
                  >
                    Rating
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      caseItem.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800'
                        : caseItem.status === 'RESOLVED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {caseItem.status}
                    </span>
                  </TableCell>
                  <TableCell>{caseItem.client.name}</TableCell>
                  <TableCell>{caseItem.duration} days</TableCell>
                  <TableCell>${caseItem.billing.totalBillable.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className={`h-4 w-4 ${
                        caseItem.metrics.averageRating >= 4 
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`} />
                      <span className="ml-2">{caseItem.metrics.averageRating.toFixed(1)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-4 w-[100px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 