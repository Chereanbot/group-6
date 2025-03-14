export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    lawyers: number;
    coordinators: number;
  };
  cases: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  services: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    revenue: number;
  };
  performance: {
    successRate: number;
    avgResolutionTime: number;
    clientSatisfaction: number;
  };
  resources: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  documents: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  };
  workload: {
    average: number;
    highPriority: number;
    overdue: number;
    upcoming: number;
  };
  caseDistribution: Array<{
    category: string;
    count: number;
  }>;
  resourceUtilization: Array<{
    resource: string;
    utilization: number;
  }>;
  revenueTrends: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
}

export interface AdminActivity {
  id: string;
  action: string;
  details: any;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  type: string;
  subStats?: Array<{
    label: string;
    value: number | string;
  }>;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
}

export interface ChartCardProps {
  title: string;
  data: ChartData;
  type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar';
  height?: number;
} 