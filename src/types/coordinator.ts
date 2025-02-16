export interface Coordinator {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    role: string;
    status: string;
  };
  type: CoordinatorType;
  officeId: string;
  office: {
    id: string;
    name: string;
    location?: string;
  };
  startDate: Date;
  endDate?: Date;
  specialties: string[];
  status: CoordinatorStatus;
  qualifications: Qualification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Qualification {
  id: string;
  type: string;
  title: string;
  institution: string;
  dateObtained: Date;
  expiryDate?: Date;
  score?: number;
}

export interface CoordinatorFilter {
  status?: CoordinatorStatus[];
  type?: CoordinatorType[];
  office?: string;
  specialties?: string[];
  search?: string;
  ids?: string[];
}

export enum CoordinatorType {
  PERMANENT = 'PERMANENT',
  PROJECT_BASED = 'PROJECT_BASED'
}

export enum CoordinatorStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface BlockResponse {
  success: boolean;
  data?: Coordinator;
  message?: string;
  error?: string;
}

export interface BlockRequest {
  action: 'block' | 'ban';
  reason: string;
}

export interface EditCoordinatorResponse {
  success: boolean;
  data?: Coordinator;
  message?: string;
  error?: string;
}

export interface EditCoordinatorRequest {
  fullName: string;
  email: string;
  phone?: string;
  type: CoordinatorType;
  officeId: string;
  startDate: string;
  endDate?: string;
  specialties: string[];
  status: CoordinatorStatus;
  qualifications: Array<{
    type: string;
    title: string;
    institution: string;
    dateObtained: string;
    expiryDate?: string;
    score?: number;
  }>;
}

export interface CoordinatorStats {
  coordinator: {
    id: string;
    office: {
      id: string;
      name: string;
      location: string;
    };
    type: string;
    status: string;
  };
  stats: {
    casesHandled: number;
    activeCases: number;
    completedCases: number;
    successRate: number;
    activeProjects: number;
    activeAssignments: number;
  };
  recentCases: any[];
  performance: any[];
  lastUpdated: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
} 