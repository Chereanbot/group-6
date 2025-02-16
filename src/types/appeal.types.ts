export enum AppealStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  HEARD = 'HEARD',
  DECIDED = 'DECIDED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface Appeal {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: AppealStatus;
  filedBy: string;
  filedDate: string;
  documents: Array<{
    id: string;
    title: string;
    path: string;
  }>;
  case: {
    title: string;
    status: string;
    priority: string;
  };
  filer: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface AppealStats {
  total: number;
  pending: number;
  scheduled: number;
  heard: number;
  decided: number;
  withdrawn: number;
  averageResolutionTime: number;
  successRate: number;
}

export interface AppealFilters {
  status?: AppealStatus[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
} 