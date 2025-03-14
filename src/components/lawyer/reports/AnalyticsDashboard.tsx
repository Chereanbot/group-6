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
  Activity,
  AlertCircle,
  BarChart,
  DollarSign,
  FileText,
  PieChart,
  Star,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import XLSX from "xlsx";

interface AnalyticsData {
  caseMetrics: {
    total: number;
    active: number;
    resolved: number;
    pending: number;
    resolutionRate: number;
  };
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrends: {
    date: string;
    count: number;
  }[];
  performance: {
    averageRating: number;
    averageResolutionTime: number;
    successRate: number;
    utilizationRate: number;
    responseTime: number;
  };
  revenue: {
    monthly: Record<number, number>;
    total: number;
    average: number;
  };
  activities: {
    id: string;
    title: string;
    description: string;
    caseName: string;
    category: string;
    date: string;
  }[];
  trafficAnalysis: {
    hourlyDistribution: {
      hour: number;
      count: number;
    }[];
    dailyActivities: {
      date: string;
      count: number;
    }[];
  };
  caseAnalytics: {
    complexity: {
      level: number;
      count: number;
    }[];
    outcomes: {
      status: string;
      count: number;
    }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/lawyer/reports/analytics");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch analytics data");
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const prepareMonthlyData = (data: AnalyticsData) => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: format(d, 'MMM'),
        cases: 0,
        revenue: 0,
      };
    }).reverse();

    // Add case counts
    data.monthlyTrends.forEach(trend => {
      const monthIndex = new Date(trend.date).getMonth();
      const monthName = format(new Date(trend.date), 'MMM');
      const monthData = months.find(m => m.month === monthName);
      if (monthData) {
        monthData.cases = trend.count;
      }
    });

    // Add revenue
    Object.entries(data.revenue.monthly).forEach(([month, amount]) => {
      const monthName = format(new Date(2024, parseInt(month), 1), 'MMM');
      const monthData = months.find(m => m.month === monthName);
      if (monthData) {
        monthData.revenue = amount;
      }
    });

    return months;
  };

  const preparePieData = (data: AnalyticsData) => {
    return data.categoryDistribution.map(cat => ({
      name: cat.category,
      value: cat.count,
    }));
  };

  const exportToExcel = (data: AnalyticsData) => {
    const workbook = {
      SheetNames: ['Overview', 'Cases', 'Revenue', 'Activities'],
      Sheets: {
        Overview: XLSX.utils.json_to_sheet([
          {
            totalCases: data.caseMetrics.total,
            activeCases: data.caseMetrics.active,
            resolvedCases: data.caseMetrics.resolved,
            pendingCases: data.caseMetrics.pending,
            resolutionRate: data.caseMetrics.resolutionRate,
            averageRating: data.performance.averageRating,
          },
        ]),
        Cases: XLSX.utils.json_to_sheet(
          data.categoryDistribution.map(cat => ({
            category: cat.category,
            count: cat.count,
            percentage: cat.percentage,
          }))
        ),
        Revenue: XLSX.utils.json_to_sheet(
          Object.entries(data.revenue.monthly).map(([month, amount]) => ({
            month: new Date(2024, parseInt(month), 1).toLocaleString('default', { month: 'long' }),
            revenue: amount,
          }))
        ),
        Activities: XLSX.utils.json_to_sheet(
          data.activities.map(activity => ({
            title: activity.title,
            description: activity.description,
            case: activity.caseName,
            category: activity.category,
            date: new Date(activity.date).toLocaleString(),
          }))
        ),
      },
    };

    XLSX.writeFile(workbook, 'lawyer-analytics-report.xlsx');
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

  const monthlyData = prepareMonthlyData(data);
  const pieData = preparePieData(data);

  return (
    <div className="space-y-8">
      {/* Case Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.caseMetrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.caseMetrics.active} active cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.caseMetrics.resolutionRate.toFixed(1)}%
            </div>
            <Progress value={data.caseMetrics.resolutionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.performance.averageResolutionTime} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.performance.successRate.toFixed(1)}%
            </div>
            <Progress value={data.performance.successRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Revenue Section */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Monthly revenue and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${data.revenue.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Average Monthly Revenue</p>
              <p className="text-2xl font-bold">
                ${data.revenue.average.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Monthly Trend</p>
              <div className="flex items-center space-x-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  View detailed chart
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Case count and revenue trends</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cases"
                stroke="#8884d8"
                name="Cases"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Case Distribution Chart */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Distribution</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Status</CardTitle>
            <CardDescription>Active vs Resolved vs Pending</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={[
                  {
                    name: 'Cases',
                    Active: data.caseMetrics.active,
                    Resolved: data.caseMetrics.resolved,
                    Pending: data.caseMetrics.pending,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Active" fill="#8884d8" />
                <Bar dataKey="Resolved" fill="#82ca9d" />
                <Bar dataKey="Pending" fill="#ffc658" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
          <CardDescription>Success rate and resolution time trends</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="cases"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorSuccess)"
                name="Case Load"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest case activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.activities.map((activity) => (
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
                    <span>Category: {activity.category}</span>
                  </div>
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

      {/* Traffic Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Traffic Analysis</CardTitle>
              <CardDescription>Hourly activity distribution</CardDescription>
            </div>
            <Button onClick={() => exportToExcel(data)} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.trafficAnalysis.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="count"
                fill="#8884d8"
                stroke="#8884d8"
                name="Activity Count"
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ff7300"
                name="Trend"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Case Complexity Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Case Complexity Analysis</CardTitle>
          <CardDescription>Distribution of case complexity levels</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%"
              data={data.caseAnalytics.complexity}>
              <PolarGrid />
              <PolarAngleAxis dataKey="level" />
              <PolarRadiusAxis />
              <Radar
                name="Complexity"
                dataKey="count"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Timeline</CardTitle>
          <CardDescription>Activity trends over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trafficAnalysis.dailyActivities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#82ca9d"
                name="Daily Activities"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Case Outcomes Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Case Outcomes</CardTitle>
          <CardDescription>Distribution of case statuses</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.caseAnalytics.outcomes}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
                label={({ status, percent }) => 
                  `${status} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.caseAnalytics.outcomes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
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