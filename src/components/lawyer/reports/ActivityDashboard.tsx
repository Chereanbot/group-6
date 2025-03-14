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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Activity,
  AlertCircle,
  Clock,
  FileText,
  BarChart as ChartIcon,
  Calendar,
} from "lucide-react";
import { format as dateFormat } from "date-fns";
import { ExportMenu } from "@/components/ui/export-menu";
import { exportToExcel, exportToPDF, exportToPNG, exportToCSV, ExportFormat } from "@/lib/export-utils";

interface ActivityData {
  dailyTrends: {
    date: string;
    count: number;
  }[];
  hourlyDistribution: {
    hour: number;
    count: number;
  }[];
  activityTypes: {
    type: string;
    count: number;
  }[];
  caseDistribution: {
    caseId: string;
    title: string;
    category: string;
    status: string;
    activityCount: number;
  }[];
  recentActivities: {
    id: string;
    title: string;
    description: string;
    type: string;
    caseName: string;
    caseCategory: string;
    caseStatus: string;
    date: string;
  }[];
  summary: {
    totalActivities: number;
    averageDaily: number;
    mostActiveHour: number;
    mostActiveCase: {
      id: string;
      count: number;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ActivityDashboard() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/lawyer/reports/case-activity");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch activity data");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching activity data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = async (format: ExportFormat) => {
    if (!data) return;

    const currentDate = dateFormat(new Date(), 'yyyy-MM-dd');
    const filename = `lawyer-activity-report-${currentDate}`;
    const exportData = {
      Summary: [{
        totalActivities: data.summary.totalActivities,
        averageDaily: data.summary.averageDaily,
        mostActiveHour: `${data.summary.mostActiveHour}:00`,
        activityTypes: data.activityTypes.length,
        activeCases: data.caseDistribution.length,
      }],
      DailyTrends: data.dailyTrends.map(trend => ({
        date: dateFormat(new Date(trend.date), 'yyyy-MM-dd'),
        count: trend.count,
      })),
      HourlyDistribution: data.hourlyDistribution,
      ActivityTypes: data.activityTypes,
      CaseDistribution: data.caseDistribution,
      RecentActivities: data.recentActivities.map(activity => ({
        title: activity.title,
        description: activity.description,
        type: activity.type,
        case: activity.caseName,
        status: activity.caseStatus,
        date: dateFormat(new Date(activity.date), 'yyyy-MM-dd HH:mm'),
      })),
    };

    try {
      switch (format) {
        case 'xlsx':
          await exportToExcel(exportData, filename);
          break;
        case 'pdf':
          await exportToPDF('activity-dashboard', filename);
          break;
        case 'png':
          await exportToPNG('activity-dashboard', filename);
          break;
        case 'csv':
          // For CSV, we'll flatten the data structure
          const flattenedData = data.recentActivities.map(activity => ({
            date: dateFormat(new Date(activity.date), 'yyyy-MM-dd HH:mm'),
            title: activity.title,
            description: activity.description,
            type: activity.type,
            case: activity.caseName,
            status: activity.caseStatus,
          }));
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
    <div id="activity-dashboard" className="space-y-8">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Dashboard</h2>
        <ExportMenu onExport={handleExport} disabled={!data} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.averageDaily} avg. daily
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Activity Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.mostActiveHour}:00
            </div>
            <p className="text-xs text-muted-foreground">
              Most active time of day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Types</CardTitle>
            <ChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activityTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Different types of activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.caseDistribution.length}</div>
            <p className="text-xs text-muted-foreground">
              Cases with recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Trend</CardTitle>
          <CardDescription>Activity volume over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.dailyTrends}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => dateFormat(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => dateFormat(new Date(date), 'MMM dd, yyyy')}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorActivity)"
                name="Activities"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Activity Distribution</CardTitle>
          <CardDescription>Activity patterns throughout the day</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour"
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(hour) => `${hour}:00 - ${hour+1}:00`}
              />
              <Bar 
                dataKey="count" 
                fill="#8884d8" 
                name="Activities"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity Types Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Types</CardTitle>
            <CardDescription>Distribution by activity type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.activityTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type"
                  label={({ type, percent }) => 
                    `${type} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.activityTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Activity Distribution</CardTitle>
            <CardDescription>Activities by case</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.caseDistribution}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="title" 
                  type="category"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar 
                  dataKey="activityCount" 
                  fill="#82ca9d"
                  name="Activities"
                  onClick={(data) => setSelectedCase(data.caseId)}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest case activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivities
              .filter(activity => !selectedCase || activity.caseName === selectedCase)
              .map((activity) => (
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
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Case: {activity.caseName}</span>
                      <span>•</span>
                      <span>Type: {activity.type}</span>
                      <span>•</span>
                      <span>Status: {activity.caseStatus}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dateFormat(new Date(activity.date), 'MMM dd, HH:mm')}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 