import { OfficeType, OfficeStatus, UserStatus, CaseStatus } from '@prisma/client';

// Office types
export interface Office {
  id: string;
  name: string;
  location: string;
  type: OfficeType;
  status: OfficeStatus;
  capacity: number;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Office metrics types
export interface OfficeMetrics {
  lawyers: {
    total: number;
    active: number;
  };
  coordinators: {
    total: number;
    active: number;
    capacity: number;
    available: number;
  };
  clients: number;
  cases: {
    total: number;
    active: number;
    resolved: number;
    pending: number;
  };
}

// Staff types
export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
}

export interface Lawyer extends StaffMember {
  caseCount: number;
}

export interface Coordinator extends StaffMember {}

// Response types
export interface FormattedOffice {
  id: string;
  name: string;
  location: string;
  type: OfficeType;
  status: OfficeStatus;
  capacity: number;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  metrics: OfficeMetrics;
  coordinators: Coordinator[];
  lawyers: Lawyer[];
}

export interface OfficeStats {
  totalOffices: number;
  activeOffices: number;
  totalStaff: number;
  totalCases: number;
  totalClients: number;
}

export interface OfficeResponse {
  success: boolean;
  data: {
    offices: FormattedOffice[];
    stats: OfficeStats;
  };
}

export interface ErrorResponse {
  success: boolean;
  error: string;
  data: null;
  details?: unknown;
}

// Request types
export interface CreateOfficeRequest {
  name: string;
  location: string;
  type: OfficeType;
  status?: OfficeStatus;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  capacity?: number;
}

export interface UpdateOfficeRequest extends Partial<CreateOfficeRequest> {
  id: string;
}

// Case status constants
export const CASE_STATUS = {
  ACTIVE: CaseStatus.ACTIVE,
  RESOLVED: CaseStatus.RESOLVED,
  PENDING: CaseStatus.PENDING,
  CANCELLED: CaseStatus.CANCELLED
} as const; 