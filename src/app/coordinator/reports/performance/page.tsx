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
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Activity,
  BarChart2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformanceMetrics {
  period: string;
  caseMetrics: {
    totalCases: number;
    resolvedCases: number;
    averageResolutionTime: number;
    complexityScore: number;
  };
  workloadMetrics: {
    activeCases: number;
    casesPerDay: number;
    billableHours: number;
    utilizationRate: number;
  };
  qualityMetrics: {
    documentationScore: number;
    timelinessScore: number;
    accuracyScore: number;
    completenessScore: number;
  };
  efficiencyMetrics: {
    resolutionRate: number;
    responseTime: number;
    throughputRate: number;
    backlogRate: number;
  };
  complianceMetrics: {
    deadlineMet: number;
    procedureFollowed: number;
    documentationComplete: number;
    regulatoryCompliance: number;
  };
}

const defaultMetrics: PerformanceMetrics = {
  period: '',
  caseMetrics: {
    totalCases: 0,
    resolvedCases: 0,
    averageResolutionTime: 0,
    complexityScore: 0
  },
  workloadMetrics: {
    activeCases: 0,
    casesPerDay: 0,
    billableHours: 0,
    utilizationRate: 0
  },
  qualityMetrics: {
    documentationScore: 0,
    timelinessScore: 0,
    accuracyScore: 0,
    completenessScore: 0
  },
  efficiencyMetrics: {
    resolutionRate: 0,
    responseTime: 0,
    throughputRate: 0,
    backlogRate: 0
  },
  complianceMetrics: {
    deadlineMet: 0,
    procedureFollowed: 0,
    documentationComplete: 0,
    regulatoryCompliance: 0
  }
};

export default function PerformanceReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [metrics, setMetrics] = useState<PerformanceMetrics>(defaultMetrics);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coordinator/reports/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      if (data.success && data.metrics) {
        // Deep merge with default values and ensure all numbers are valid
        const mergedMetrics = {
          ...defaultMetrics,
          ...data.metrics,
          caseMetrics: {
            ...defaultMetrics.caseMetrics,
            ...data.metrics.caseMetrics,
            totalCases: Number(data.metrics.caseMetrics?.totalCases) || 0,
            resolvedCases: Number(data.metrics.caseMetrics?.resolvedCases) || 0,
            averageResolutionTime: Number(data.metrics.caseMetrics?.averageResolutionTime) || 0,
            complexityScore: Number(data.metrics.caseMetrics?.complexityScore) || 0
          },
          workloadMetrics: {
            ...defaultMetrics.workloadMetrics,
            ...data.metrics.workloadMetrics,
            activeCases: Number(data.metrics.workloadMetrics?.activeCases) || 0,
            casesPerDay: Number(data.metrics.workloadMetrics?.casesPerDay) || 0,
            billableHours: Number(data.metrics.workloadMetrics?.billableHours) || 0,
            utilizationRate: Number(data.metrics.workloadMetrics?.utilizationRate) || 0
          },
          qualityMetrics: {
            ...defaultMetrics.qualityMetrics,
            ...data.metrics.qualityMetrics,
            documentationScore: Number(data.metrics.qualityMetrics?.documentationScore) || 0,
            timelinessScore: Number(data.metrics.qualityMetrics?.timelinessScore) || 0,
            accuracyScore: Number(data.metrics.qualityMetrics?.accuracyScore) || 0,
            completenessScore: Number(data.metrics.qualityMetrics?.completenessScore) || 0
          },
          efficiencyMetrics: {
            ...defaultMetrics.efficiencyMetrics,
            ...data.metrics.efficiencyMetrics,
            resolutionRate: Number(data.metrics.efficiencyMetrics?.resolutionRate) || 0,
            responseTime: Number(data.metrics.efficiencyMetrics?.responseTime) || 0,
            throughputRate: Number(data.metrics.efficiencyMetrics?.throughputRate) || 0,
            backlogRate: Number(data.metrics.efficiencyMetrics?.backlogRate) || 0
          },
          complianceMetrics: {
            ...defaultMetrics.complianceMetrics,
            ...data.metrics.complianceMetrics,
            deadlineMet: Number(data.metrics.complianceMetrics?.deadlineMet) || 0,
            procedureFollowed: Number(data.metrics.complianceMetrics?.procedureFollowed) || 0,
            documentationComplete: Number(data.metrics.complianceMetrics?.documentationComplete) || 0,
            regulatoryCompliance: Number(data.metrics.complianceMetrics?.regulatoryCompliance) || 0
          }
        };
        setMetrics(mergedMetrics);
      } else {
        throw new Error(data.message || 'Failed to fetch metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: 'Failed to fetch performance metrics',
        variant: "destructive",
      });
      setMetrics(defaultMetrics);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceMetrics();
  }, [selectedPeriod]);

  const renderScore = (score: number) => {
    const validScore = Number(score) || 0;
    let color = 'text-gray-500';
    if (validScore >= 80) color = 'text-green-500';
    else if (validScore >= 60) color = 'text-yellow-500';
    else if (validScore < 60) color = 'text-red-500';

    return <span className={color}>{validScore.toFixed(1)}%</span>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading performance metrics...</p>
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
        <h1 className="text-2xl font-bold">Performance Analytics</h1>
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
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.efficiencyMetrics.resolutionRate.toFixed(1)}%
              </div>
              <Progress
                value={metrics.efficiencyMetrics.resolutionRate}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workload Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metrics.workloadMetrics.utilizationRate.toFixed(1)}%
              </div>
              <Progress
                value={metrics.workloadMetrics.utilizationRate}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {((
                  metrics.qualityMetrics.documentationScore +
                  metrics.qualityMetrics.timelinessScore +
                  metrics.qualityMetrics.accuracyScore +
                  metrics.qualityMetrics.completenessScore
                ) / 4).toFixed(1)}%
              </div>
              <Progress
                value={(
                  metrics.qualityMetrics.documentationScore +
                  metrics.qualityMetrics.timelinessScore +
                  metrics.qualityMetrics.accuracyScore +
                  metrics.qualityMetrics.completenessScore
                ) / 4}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {((
                  metrics.complianceMetrics.deadlineMet +
                  metrics.complianceMetrics.procedureFollowed +
                  metrics.complianceMetrics.documentationComplete +
                  metrics.complianceMetrics.regulatoryCompliance
                ) / 4).toFixed(1)}%
              </div>
              <Progress
                value={(
                  metrics.complianceMetrics.deadlineMet +
                  metrics.complianceMetrics.procedureFollowed +
                  metrics.complianceMetrics.documentationComplete +
                  metrics.complianceMetrics.regulatoryCompliance
                ) / 4}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="efficiency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="efficiency">
            <Activity className="w-4 h-4 mr-2" />
            Efficiency
          </TabsTrigger>
          <TabsTrigger value="quality">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="workload">
            <BarChart2 className="w-4 h-4 mr-2" />
            Workload
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <AlertCircle className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resolution Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Resolution Rate</span>
                      <span className="text-sm text-gray-600">
                        {metrics.efficiencyMetrics.resolutionRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.efficiencyMetrics.resolutionRate}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-gray-600">
                        {metrics.efficiencyMetrics.responseTime.toFixed(1)} hours
                      </span>
                    </div>
                    <Progress
                      value={100 - (metrics.efficiencyMetrics.responseTime / 24 * 100)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Throughput Rate</span>
                      <span className="text-sm text-gray-600">
                        {metrics.efficiencyMetrics.throughputRate.toFixed(1)} cases/day
                      </span>
                    </div>
                    <Progress
                      value={metrics.efficiencyMetrics.throughputRate * 20}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Case Complexity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Average Resolution Time</span>
                      <span className="text-sm text-gray-600">
                        {metrics.caseMetrics.averageResolutionTime.toFixed(1)} days
                      </span>
                    </div>
                    <Progress
                      value={100 - (metrics.caseMetrics.averageResolutionTime / 30 * 100)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Complexity Score</span>
                      <span className="text-sm text-gray-600">
                        {metrics.caseMetrics.complexityScore.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress
                      value={metrics.caseMetrics.complexityScore * 10}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Backlog Rate</span>
                      <span className="text-sm text-gray-600">
                        {metrics.efficiencyMetrics.backlogRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={100 - metrics.efficiencyMetrics.backlogRate}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Documentation</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.qualityMetrics.documentationScore)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.qualityMetrics.documentationScore}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Timeliness</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.qualityMetrics.timelinessScore)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.qualityMetrics.timelinessScore}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.qualityMetrics.accuracyScore)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.qualityMetrics.accuracyScore}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Completeness</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.qualityMetrics.completenessScore)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.qualityMetrics.completenessScore}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Active Cases</span>
                      <span className="text-sm text-gray-600">
                        {metrics.workloadMetrics.activeCases}
                      </span>
                    </div>
                    <Progress
                      value={(metrics.workloadMetrics.activeCases / 20) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Cases Per Day</span>
                      <span className="text-sm text-gray-600">
                        {metrics.workloadMetrics.casesPerDay.toFixed(1)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.workloadMetrics.casesPerDay * 20}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Billable Hours</span>
                      <span className="text-sm text-gray-600">
                        {metrics.workloadMetrics.billableHours.toFixed(1)}h
                      </span>
                    </div>
                    <Progress
                      value={(metrics.workloadMetrics.billableHours / 8) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Case Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Total Cases</span>
                      <span className="text-sm text-gray-600">
                        {metrics.caseMetrics.totalCases}
                      </span>
                    </div>
                    <Progress
                      value={(metrics.caseMetrics.totalCases / 50) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Resolved Cases</span>
                      <span className="text-sm text-gray-600">
                        {metrics.caseMetrics.resolvedCases}
                      </span>
                    </div>
                    <Progress
                      value={(metrics.caseMetrics.resolvedCases / metrics.caseMetrics.totalCases) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Utilization Rate</span>
                      <span className="text-sm text-gray-600">
                        {metrics.workloadMetrics.utilizationRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={metrics.workloadMetrics.utilizationRate}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Deadlines Met</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.complianceMetrics.deadlineMet)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.complianceMetrics.deadlineMet}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Procedures Followed</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.complianceMetrics.procedureFollowed)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.complianceMetrics.procedureFollowed}
                      className="h-2"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Documentation Complete</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.complianceMetrics.documentationComplete)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.complianceMetrics.documentationComplete}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Regulatory Compliance</span>
                      <span className="text-sm text-gray-600">
                        {renderScore(metrics.complianceMetrics.regulatoryCompliance)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.complianceMetrics.regulatoryCompliance}
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