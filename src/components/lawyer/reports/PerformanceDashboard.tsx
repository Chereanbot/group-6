"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, DollarSign, Star, Clock, CheckCircle, Users, AlertCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ExportMenu } from "@/components/ui/export-menu";
import { exportToExcel, exportToPDF, exportToPNG, exportToCSV, ExportFormat } from "@/lib/export-utils";

interface PerformanceData {
  overview: {
    totalCases: number;
    completedCases: number;
    successRate: number;
    averageDuration: number;
    averageRating: string;
  };
  billing: {
    totalBillableHours: number;
    totalBillableAmount: number;
    averageHourlyRate: number;
  };
  workload: {
    caseCount: number;
    utilizationRate: number;
    responseTime: number;
  };
  recentActivities: {
    id: string;
    title: string;
    description: string;
    caseName: string;
    date: string;
  }[];
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/lawyer/reports/performance");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch data");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching performance data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = async (format: ExportFormat) => {
    if (!data) return;

    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const filename = `lawyer-performance-report-${currentDate}`;
    const exportData = {
      Overview: [{
        totalCases: data.overview.totalCases,
        completedCases: data.overview.completedCases,
        successRate: `${data.overview.successRate.toFixed(1)}%`,
        averageDuration: `${data.overview.averageDuration} days`,
        averageRating: data.overview.averageRating,
      }],
      Billing: [{
        totalBillableHours: data.billing.totalBillableHours,
        totalBillableAmount: data.billing.totalBillableAmount,
        averageHourlyRate: data.billing.averageHourlyRate,
      }],
      Workload: [{
        caseCount: data.workload.caseCount,
        utilizationRate: `${data.workload.utilizationRate}%`,
        responseTime: `${data.workload.responseTime} hours`,
      }],
      RecentActivities: data.recentActivities.map(activity => ({
        title: activity.title,
        description: activity.description,
        case: activity.caseName,
        date: format(new Date(activity.date), 'yyyy-MM-dd HH:mm'),
      })),
    };

    try {
      switch (format) {
        case 'xlsx':
          await exportToExcel(exportData, filename);
          break;
        case 'pdf':
          await exportToPDF('performance-dashboard', filename);
          break;
        case 'png':
          await exportToPNG('performance-dashboard', filename);
          break;
        case 'csv':
          // For CSV, we'll flatten the data structure
          const flattenedData = [
            {
              ...exportData.Overview[0],
              ...exportData.Billing[0],
              ...exportData.Workload[0],
            },
          ];
          exportToCSV(flattenedData, filename);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      // You might want to show a toast notification here
    }
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
    <div id="performance-dashboard" className="space-y-8">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <ExportMenu onExport={handleExport} disabled={!data} />
      </div>

      {/* Overview Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.completedCases} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.overview.successRate.toFixed(1)}%
            </div>
            <Progress value={data.overview.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageRating}</div>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < parseInt(data.overview.averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Overview</CardTitle>
          <CardDescription>Your billing and revenue metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Total Billable Hours</p>
              <p className="text-2xl font-bold">{data.billing.totalBillableHours}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${data.billing.totalBillableAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Average Hourly Rate</p>
              <p className="text-2xl font-bold">
                ${data.billing.averageHourlyRate}/hr
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Metrics</CardTitle>
          <CardDescription>Current workload and efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Active Cases</p>
              <p className="text-2xl font-bold">{data.workload.caseCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Utilization Rate</p>
              <div className="mt-2">
                <Progress value={data.workload.utilizationRate} />
                <p className="text-sm mt-1">
                  {data.workload.utilizationRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Avg. Response Time</p>
              <p className="text-2xl font-bold">
                {data.workload.responseTime.toFixed(1)} hrs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest case activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 border-b last:border-0 pb-4"
              >
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Case: {activity.caseName}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.date), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
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
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, j) => (
                <div key={j}>
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-[80px] mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 