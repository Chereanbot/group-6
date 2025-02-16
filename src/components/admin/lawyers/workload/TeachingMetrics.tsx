import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from 'recharts';
import { useState } from 'react';
import { TeachingMetrics as TeachingMetricsType } from '@/app/admin/lawyers/workload/page';

interface TeachingMetricsProps {
  metrics: TeachingMetricsType[];
  loading: boolean;
}

export function TeachingMetrics({ metrics, loading }: TeachingMetricsProps) {
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

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
  const scheduleData = metrics.flatMap(metric => metric.weeklySchedule);
  const teachingHoursData = metrics.map(metric => ({
    lawyer: metric.lawyer.name,
    ...metric.teachingHours,
  }));
  const creditHoursData = metrics.map(metric => ({
    lawyer: metric.lawyer.name,
    ...metric.creditHourDistribution,
  }));
  const classMetricsData = metrics.map(metric => ({
    lawyer: metric.lawyer.name,
    ...metric.classMetrics,
  }));
  const teachingTrendsData = metrics.flatMap(metric => metric.teachingTrends);

  return (
    <Card className="p-4">
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="hours">Teaching Hours</TabsTrigger>
          <TabsTrigger value="credits">Credit Hours</TabsTrigger>
          <TabsTrigger value="metrics">Class Metrics</TabsTrigger>
          <TabsTrigger value="trends">Teaching Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lawyer</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Credit Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.map((schedule, index) => (
                  <TableRow key={index}>
                    <TableCell>{metrics.find(m => m.weeklySchedule.includes(schedule))?.lawyer.name}</TableCell>
                    <TableCell>{schedule.course}</TableCell>
                    <TableCell>{schedule.dayOfWeek}</TableCell>
                    <TableCell>{new Date(schedule.startTime).toLocaleTimeString()}</TableCell>
                    <TableCell>{new Date(schedule.endTime).toLocaleTimeString()}</TableCell>
                    <TableCell>{schedule.creditHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Select
            value={periodType}
            onValueChange={(value) => setPeriodType(value as 'weekly' | 'monthly' | 'yearly')}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teachingHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lawyer" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey={`${periodType}Hours`}
                  fill="#0088FE"
                  name={`${periodType.charAt(0).toUpperCase() + periodType.slice(1)} Hours`}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Select
            value={periodType}
            onValueChange={(value) => setPeriodType(value as 'weekly' | 'monthly' | 'yearly')}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lawyer" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey={`${periodType}Credits`}
                  fill="#00C49F"
                  name={`${periodType.charAt(0).toUpperCase() + periodType.slice(1)} Credits`}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lawyer" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalClasses" fill="#0088FE" name="Total Classes" />
              <Bar dataKey="completedClasses" fill="#00C49F" name="Completed" />
              <Bar dataKey="upcomingClasses" fill="#FFBB28" name="Upcoming" />
              <Bar dataKey="averageAttendance" fill="#FF8042" name="Avg. Attendance" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trends" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={teachingTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="averageHours"
                stroke="#0088FE"
                name="Avg. Hours"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="averageCredits"
                stroke="#00C49F"
                name="Avg. Credits"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalClasses"
                stroke="#FFBB28"
                name="Total Classes"
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 