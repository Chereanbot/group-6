export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp: Date;
}

export interface PerformanceMetric {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CaseStatistics {
  totalCases: ChartDataPoint[];
  resolvedCases: ChartDataPoint[];
  pendingCases: ChartDataPoint[];
  successRate: PerformanceMetric;
  avgResolutionTime: PerformanceMetric;
}

export interface RevenueStatistics {
  monthly: ChartDataPoint[];
  quarterly: ChartDataPoint[];
  annual: ChartDataPoint[];
  growth: PerformanceMetric;
  projectedRevenue: number;
}

export interface ChartOptions {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
    }[];
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: {
      y?: {
        beginAtZero?: boolean;
        ticks?: {
          callback?: (value: number) => string;
        };
      };
    };
    plugins?: {
      legend?: {
        position?: 'top' | 'bottom' | 'left' | 'right';
        display?: boolean;
      };
      tooltip?: {
        enabled?: boolean;
        callbacks?: {
          label?: (context: any) => string;
        };
      };
    };
  };
}

export interface DashboardChartData {
  cases: {
    daily: ChartOptions;
    weekly: ChartOptions;
    monthly: ChartOptions;
    distribution: ChartOptions;
  };
  revenue: {
    trend: ChartOptions;
    breakdown: ChartOptions;
    forecast: ChartOptions;
  };
  performance: {
    metrics: ChartOptions;
    comparison: ChartOptions;
    timeline: ChartOptions;
  };
}

export interface ChartPeriod {
  start: Date;
  end: Date;
  interval: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ChartFilter {
  period: ChartPeriod;
  categories?: string[];
  metrics?: string[];
  comparison?: boolean;
  cumulative?: boolean;
}

export interface ChartTheme {
  backgroundColor: string[];
  borderColor: string[];
  gridColor: string;
  textColor: string;
  tooltipBackground: string;
  tooltipText: string;
}

// Default chart themes
export const lightTheme: ChartTheme = {
  backgroundColor: [
    'rgba(59, 130, 246, 0.5)', // blue
    'rgba(16, 185, 129, 0.5)', // green
    'rgba(249, 115, 22, 0.5)', // orange
    'rgba(139, 92, 246, 0.5)', // purple
  ],
  borderColor: [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(249, 115, 22)',
    'rgb(139, 92, 246)',
  ],
  gridColor: 'rgba(156, 163, 175, 0.2)',
  textColor: 'rgb(55, 65, 81)',
  tooltipBackground: 'rgba(255, 255, 255, 0.98)',
  tooltipText: 'rgb(55, 65, 81)',
};

export const darkTheme: ChartTheme = {
  backgroundColor: [
    'rgba(96, 165, 250, 0.5)',
    'rgba(34, 197, 94, 0.5)',
    'rgba(251, 146, 60, 0.5)',
    'rgba(167, 139, 250, 0.5)',
  ],
  borderColor: [
    'rgb(96, 165, 250)',
    'rgb(34, 197, 94)',
    'rgb(251, 146, 60)',
    'rgb(167, 139, 250)',
  ],
  gridColor: 'rgba(107, 114, 128, 0.2)',
  textColor: 'rgb(229, 231, 235)',
  tooltipBackground: 'rgba(31, 41, 55, 0.98)',
  tooltipText: 'rgb(229, 231, 235)',
};

// Chart utility types
export interface ChartDateRange {
  start: Date;
  end: Date;
}

export interface ChartMetric {
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  target?: number;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
} 