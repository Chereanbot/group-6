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