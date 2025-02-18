"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, subMonths } from 'date-fns';
import { 
  Users,
  UserPlus,
  UserCheck,
  Activity,
  BarChart2,
  PieChart,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ClientStatistics {
  period: string;
  overview: {
    totalClients: number;
    activeClients: number;
    newClients: number;
    returningClients: number;
  };
  demographics: {
    byLocation: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
    byType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  };
  engagement: {
    averageCasesPerClient: number;
    clientRetentionRate: number;
    averageResponseTime: number;
    satisfactionScore: number;
  };
  caseDistribution: {
    byCaseType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    byPriority: Array<{
      priority: string;
      count: number;
      percentage: number;
    }>;
  };
  trends: {
    clientGrowth: number;
    caseVolume: number;
    averageResolutionTime: number;
    clientSatisfaction: number;
  };
}

const defaultStats: ClientStatistics = {
  period: '',
  overview: {
    totalClients: 0,
    activeClients: 0,
    newClients: 0,
    returningClients: 0
  },
  demographics: {
    byLocation: [],
    byType: []
  },
  engagement: {
    averageCasesPerClient: 0,
    clientRetentionRate: 0,
    averageResponseTime: 0,
    satisfactionScore: 0
  },
  caseDistribution: {
    byCaseType: [],
    byPriority: []
  },
  trends: {
    clientGrowth: 0,
    caseVolume: 0,
    averageResolutionTime: 0,
    clientSatisfaction: 0
  }
};

export default function ClientStatisticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [stats, setStats] = useState<ClientStatistics>(defaultStats);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coordinator/reports/client-statistics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      if (data.success && data.statistics) {
        setStats({
          ...defaultStats,
          ...data.statistics,
        });
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch client statistics',
        variant: "destructive",
      });
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const renderTrend = (value: number | null) => {
    if (value === null) value = 0;
    const Icon = value >= 0 ? TrendingUp : TrendingDown;
    const color = value >= 0 ? 'text-green-500' : 'text-red-500';
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="w-4 h-4 mr-1" />
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading client statistics...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Statistics</h1>
        <Select
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stats.overview.totalClients}</div>
                <div className="text-xs text-gray-500">
                  {stats.overview.activeClients} active
                </div>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stats.overview.newClients}</div>
                <div className="text-xs text-gray-500">
                  {renderTrend(stats.trends.clientGrowth)}
                </div>
              </div>
              <UserPlus className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {(stats.engagement.clientRetentionRate || 0).toFixed(1)}%
              </div>
              <Progress
                value={stats.engagement.clientRetentionRate || 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {(stats.engagement.satisfactionScore || 0).toFixed(1)}%
              </div>
              <Progress
                value={stats.engagement.satisfactionScore || 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demographics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demographics">
            <Users className="w-4 h-4 mr-2" />
            Demographics
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Activity className="w-4 h-4 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="cases">
            <BarChart2 className="w-4 h-4 mr-2" />
            Case Distribution
          </TabsTrigger>
          <TabsTrigger value="trends">
            <PieChart className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Clients</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.demographics.byLocation.map((item) => (
                        <TableRow key={item.location}>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Clients</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.demographics.byType.map((item) => (
                        <TableRow key={item.type}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Client Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Average Cases per Client</span>
                      <span className="text-sm text-gray-600">
                        {(stats.engagement.averageCasesPerClient || 0).toFixed(1)}
                      </span>
                    </div>
                    <Progress
                      value={((stats.engagement.averageCasesPerClient || 0) / 5) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Client Retention Rate</span>
                      <span className="text-sm text-gray-600">
                        {(stats.engagement.clientRetentionRate || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={stats.engagement.clientRetentionRate || 0}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="text-sm text-gray-600">
                        {(stats.engagement.averageResponseTime || 0).toFixed(1)} hours
                      </span>
                    </div>
                    <Progress
                      value={100 - ((stats.engagement.averageResponseTime || 0) / 24 * 100)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Satisfaction Score</span>
                      <span className="text-sm text-gray-600">
                        {(stats.engagement.satisfactionScore || 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={stats.engagement.satisfactionScore || 0}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cases by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.caseDistribution.byCaseType.map((item) => (
                        <TableRow key={item.type}>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cases by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.caseDistribution.byPriority.map((item) => (
                        <TableRow key={item.priority}>
                          <TableCell>{item.priority}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Client Growth</span>
                      <span className="text-sm text-gray-600">
                        {renderTrend(stats.trends.clientGrowth)}
                      </span>
                    </div>
                    <Progress
                      value={50 + (stats.trends.clientGrowth / 2)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Case Volume Change</span>
                      <span className="text-sm text-gray-600">
                        {renderTrend(stats.trends.caseVolume)}
                      </span>
                    </div>
                    <Progress
                      value={50 + (stats.trends.caseVolume / 2)}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Resolution Time Change</span>
                      <span className="text-sm text-gray-600">
                        {renderTrend(-stats.trends.averageResolutionTime)}
                      </span>
                    </div>
                    <Progress
                      value={50 - (stats.trends.averageResolutionTime / 2)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Satisfaction Trend</span>
                      <span className="text-sm text-gray-600">
                        {renderTrend(stats.trends.clientSatisfaction)}
                      </span>
                    </div>
                    <Progress
                      value={50 + (stats.trends.clientSatisfaction / 2)}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 