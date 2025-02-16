import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CaseDistributionProps {
  data: Array<{
    category: string;
    _count: number;
  }>;
}

export function CaseDistribution({ data }: CaseDistributionProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2'];

  // Process data for the chart
  const chartData = data.map(item => ({
    name: item.category.replace('_', ' '),
    value: item._count
  }));

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Case Distribution</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Table */}
      <div className="mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2">Category</th>
              <th className="text-right py-2">Count</th>
              <th className="text-right py-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2">{item.name}</td>
                <td className="text-right py-2">{item.value}</td>
                <td className="text-right py-2">
                  {((item.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
} 