import { CoordinatorHistoryAction } from '@prisma/client';

export interface HistoryEntry {
  id: string;
  action: CoordinatorHistoryAction;
  changeDetails: string;
  previousValue: any;
  newValue: any;
  context: any;
  metadata: any;
  changedAt: string;
  createdAt: string;
  updatedAt: string;
  coordinatorId: string;
  clientId?: string;
  caseId?: string;
  lawyerId?: string;
  officeId?: string;
  documentId?: string;
  appointmentId?: string;
  serviceRequestId?: string;
  changedBy: string;
  client?: {
    id: string;
    fullName: string;
    status: string;
  };
  case?: {
    id: string;
    title: string;
    status: string;
  };
  lawyer?: {
    id: string;
    fullName: string;
    status: string;
  };
  office?: {
    id: string;
    name: string;
    status: string;
  };
  document?: {
    id: string;
    title: string;
    status: string;
  };
  appointment?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  serviceRequest?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface HistoryFilters {
  search?: string;
  action?: CoordinatorHistoryAction;
  startDate?: string;
  endDate?: string;
  entityType?: string;
  status?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
} 