import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface WorkloadOverviewProps {
  data: any;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function WorkloadOverview({ data, loading }: WorkloadOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No workload data available</p>
      </div>
    );
  }

  const {
    caseDistribution,
    workloadByLawyer,
    workloadTrends,
    utilizationRate,
    capacityMetrics,
    performanceIndicators
  } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Case Distribution */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Case Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {caseDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Workload by Lawyer */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Workload by Lawyer</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadByLawyer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeCases" fill="#0088FE" name="Active Cases" />
                <Bar dataKey="pendingCases" fill="#00C49F" name="Pending Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Utilization Rate */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Utilization Rate</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lawyer" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#FFBB28" name="Utilization Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Capacity Metrics */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Capacity Metrics</h3>
          <div className="space-y-4">
            {capacityMetrics.map((metric: any) => (
              <div key={metric.name} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{metric.name}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Indicators */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Performance Indicators</h3>
          <div className="space-y-4">
            {performanceIndicators.map((indicator: any) => (
              <div key={indicator.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{indicator.name}</span>
                  <span className="font-medium">{indicator.value}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${indicator.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Workload Trends */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Workload Trends</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalCases" fill="#FF8042" name="Total Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
} 