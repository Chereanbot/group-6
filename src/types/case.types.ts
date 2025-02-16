export interface CaseMetrics {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  resolvedCases: number;
  highPriorityCases: number;
  averageResolutionTime: number;
  successRate: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  icon?: JSX.Element;
}

export interface TrafficMetrics {
  newCases: { count: number; trend: number };
  resolvedCases: { count: number; trend: number };
  averageResolutionTime: { days: number; trend: number };
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string | string[];
  borderWidth?: number;
  stack?: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartData {
  progressData: {
    labels: string[];
    datasets: ChartDataset[];
  };
  resolutionData: {
    labels: string[];
    datasets: ChartDataset[];
  };
  resolutionTrends: {
    labels: string[];
    datasets: ChartDataset[];
  };
  complexityData: {
    labels: string[];
    datasets: ChartDataset[];
  };
}

export interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'PENDING' | 'RESOLVED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: Date;
  resolvedAt?: Date | null;
  lawyerId?: string | null;
  clientId: string;
  officeId?: string | null;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  lawyerProfile?: {
    id: string;
    specializations: string[];
    experience: number;
    rating?: number;
    caseLoad: number;
    availability: boolean;
  } | null;
} 