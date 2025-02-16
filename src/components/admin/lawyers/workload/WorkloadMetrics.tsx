import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { WorkloadMetrics as WorkloadMetricsType } from '@/app/admin/lawyers/workload/page';

interface WorkloadMetricsProps {
  data: WorkloadMetricsType[];
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function WorkloadMetrics({ data, loading }: WorkloadMetricsProps) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  // Transform data for charts
  const workloadDistribution = data.map(metric => ({
    lawyer: metric.lawyer.name,
    caseCount: metric.caseCount,
    completedCases: metric.completedCases
  }));

  const performanceTrends = data.map(metric => ({
    lawyer: metric.lawyer.name,
    averageRating: metric.averageRating,
    utilizationRate: metric.utilizationRate,
    responseTime: metric.responseTime
  }));

  const efficiencyMetrics = data.map(metric => ({
    lawyer: metric.lawyer.name,
    utilizationRate: metric.utilizationRate,
    responseTime: metric.responseTime
  }));

  return (
    <Card className="p-4">
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Workload Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lawyer" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="caseCount" fill="#0088FE" name="Total Cases" />
              <Bar dataKey="completedCases" fill="#00C49F" name="Completed Cases" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="performance" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lawyer" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="averageRating"
                fill="#0088FE"
                name="Average Rating"
              />
              <Bar
                yAxisId="right"
                dataKey="utilizationRate"
                fill="#00C49F"
                name="Utilization Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="efficiency" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={efficiencyMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lawyer" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="utilizationRate"
                fill="#0088FE"
                name="Utilization Rate (%)"
              />
              <Bar
                yAxisId="right"
                dataKey="responseTime"
                fill="#00C49F"
                name="Response Time (hours)"
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 