import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  name: string;
  value: number;
}

interface PerformanceChartProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: number) => string;
}

export function PerformanceChart({ 
  title, 
  data, 
  dataKey, 
  color = "#8884d8",
  yAxisLabel,
  tooltipFormatter = (value) => `${value}` 
}: PerformanceChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={yAxisLabel ? { 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft' 
                } : undefined}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={tooltipFormatter}
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={title}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 