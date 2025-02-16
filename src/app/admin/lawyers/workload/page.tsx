"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkloadOverview } from '@/components/admin/lawyers/workload/WorkloadOverview';
import { WorkloadAssignments } from '@/components/admin/lawyers/workload/WorkloadAssignments';
import { WorkloadSchedule } from '@/components/admin/lawyers/workload/WorkloadSchedule';
import { WorkloadMetrics } from '@/components/admin/lawyers/workload/WorkloadMetrics';
import { TeachingMetrics } from '@/components/admin/lawyers/workload/TeachingMetrics';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export type WorkStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
export type WorkType = 'CASE_WORK' | 'RESEARCH' | 'DOCUMENT_REVIEW' | 'CLIENT_MEETING' | 'COURT_APPEARANCE' | 'ADMINISTRATIVE' | 'TRAINING';
export type ComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type ScheduleStatus = 'AVAILABLE' | 'BUSY' | 'OUT_OF_OFFICE' | 'ON_LEAVE';
export type ScheduleType = 'REGULAR' | 'OVERTIME' | 'ON_CALL' | 'LEAVE';
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE';

export interface WorkAssignment {
  id: string;
  lawyerId: string;
  lawyer: {
    name: string;
    email: string;
  };
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: WorkStatus;
  type: WorkType;
  estimatedHours: number;
  actualHours?: number;
  complexity: ComplexityLevel;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  caseId?: string;
  case?: {
    title: string;
    clientName: string;
  };
  progress: number;
  notes?: string;
  blockers?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSchedule {
  id: string;
  lawyerId: string;
  lawyer: {
    name: string;
    email: string;
  };
  date: Date;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  type: ScheduleType;
  recurrence?: RecurrenceType;
  isAvailable: boolean;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkloadMetrics {
  id: string;
  lawyerId: string;
  lawyer: {
    name: string;
    email: string;
  };
  period: Date;
  caseCount: number;
  completedCases: number;
  averageRating: number;
  utilizationRate: number;
  responseTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeachingMetrics {
  id: string;
  lawyerId: string;
  lawyer: {
    name: string;
    email: string;
  };
  weeklySchedule: {
    course: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    creditHours: number;
  }[];
  teachingHours: {
    weeklyHours: number;
    monthlyHours: number;
    yearlyHours: number;
  };
  creditHourDistribution: {
    weeklyCredits: number;
    monthlyCredits: number;
    yearlyCredits: number;
  };
  classMetrics: {
    totalClasses: number;
    completedClasses: number;
    upcomingClasses: number;
    averageAttendance: number;
  };
  teachingTrends: {
    month: string;
    averageHours: number;
    averageCredits: number;
    totalClasses: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export default function LawyerWorkloadPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [metrics, setMetrics] = useState<WorkloadMetrics[]>([]);
  const [teachingMetrics, setTeachingMetrics] = useState<TeachingMetrics[]>([]);

  const loadWorkloadData = async () => {
    try {
      setLoading(true);
      const [workloadRes, assignmentsRes, schedulesRes, metricsRes, teachingRes] = await Promise.all([
        fetch('/api/admin/lawyers/workload'),
        fetch('/api/admin/lawyers/workload/assignments'),
        fetch('/api/admin/lawyers/workload/schedules'),
        fetch('/api/admin/lawyers/workload/metrics'),
        fetch('/api/admin/lawyers/teaching/metrics')
      ]);

      if (!workloadRes.ok || !assignmentsRes.ok || !schedulesRes.ok || !metricsRes.ok || !teachingRes.ok) {
        throw new Error('Failed to fetch workload data');
      }

      const [workloadData, assignmentsData, schedulesData, metricsData, teachingData] = await Promise.all([
        workloadRes.json(),
        assignmentsRes.json(),
        schedulesRes.json(),
        metricsRes.json(),
        teachingRes.json()
      ]);

      setWorkloadData(workloadData);
      setAssignments(assignmentsData);
      setSchedules(schedulesData);
      setMetrics(metricsData);
      setTeachingMetrics(teachingData);
    } catch (error) {
      console.error('Error loading workload data:', error);
      toast.error('Failed to load workload data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkloadData();
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">
            Lawyer Workload Management
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground-dark mt-1">
            Monitor and manage lawyer workload, assignments, schedules, and teaching activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadWorkloadData}
            variant="outline"
          >
            Refresh
          </Button>
          <Button
            onClick={() => window.location.href = '/admin/lawyers/workload/assignments/new'}
          >
            New Assignment
          </Button>
          <Button
            onClick={() => window.location.href = '/admin/lawyers/workload/schedules/new'}
          >
            New Schedule
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="teaching">Teaching</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WorkloadOverview 
            data={workloadData} 
            loading={loading} 
          />
        </TabsContent>

        <TabsContent value="assignments">
          <WorkloadAssignments 
            assignments={assignments}
            loading={loading}
            onRefresh={loadWorkloadData}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <WorkloadSchedule 
            schedules={schedules}
            loading={loading}
            onRefresh={loadWorkloadData}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <WorkloadMetrics 
            data={metrics}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="teaching">
          <TeachingMetrics 
            metrics={teachingMetrics}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 