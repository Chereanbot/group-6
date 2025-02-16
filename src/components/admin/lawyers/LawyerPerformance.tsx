import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Performance {
  lawyer: {
    user: {
      fullName: string;
    };
  };
  metric: string;
  value: number;
  period: string;
  createdAt: string;
}

interface LawyerPerformanceProps {
  data: Performance[];
}

export function LawyerPerformance({ data }: LawyerPerformanceProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
        <p className="text-muted-foreground">No performance data available</p>
      </Card>
    );
  }

  // Process data for the charts
  const processedData = data.reduce((acc: any[], curr) => {
    const date = new Date(curr.createdAt).toLocaleDateString();
    const existing = acc.find(item => item.date === date);

    if (existing) {
      existing[curr.metric] = curr.value;
    } else {
      acc.push({
        date,
        [curr.metric]: curr.value,
        name: curr.lawyer.user.fullName
      });
    }

    return acc;
  }, []);

  // Get unique metrics for lines
  const metrics = Array.from(new Set(data.map(item => item.metric)));
  const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'];

  // Calculate performance trends
  const calculateTrend = (metric: string) => {
    const values = processedData.map(item => item[metric] || 0);
    const current = values[values.length - 1];
    const previous = values[values.length - 2] || 0;
    const change = ((current - previous) / previous) * 100;
    return {
      current,
      change: isFinite(change) ? change : 0
    };
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="overview">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Performance Metrics</h3>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {metrics.map((metric, index) => {
              const trend = calculateTrend(metric);
              return (
                <div key={metric} className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">{metric}</h4>
                  <div className="mt-2 flex justify-between items-baseline">
                    <span className="text-2xl font-bold">{trend.current.toFixed(1)}</span>
                    <span className={`text-sm ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.change >= 0 ? '↑' : '↓'} {Math.abs(trend.change).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {metrics.map((metric, index) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {metrics.map((metric, index) => (
                  <Bar
                    key={metric}
                    dataKey={metric}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={metric} className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-2">{metric} Distribution</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey={metric} fill={colors[index % colors.length]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 