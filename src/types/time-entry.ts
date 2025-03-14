export type ServiceType = 'CONSULTATION' | 'DOCUMENT_PREPARATION' | 'COURT_APPEARANCE' | 'RESEARCH' | 'COMMUNITY_OUTREACH' | 'MEDIATION' | 'CLIENT_MEETING' | 'CASE_REVIEW';

export enum TimeEntryStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface TimeEntry {
  id: string;
  description: string;
  status: TimeEntryStatus;
  createdAt: Date;
  updatedAt: Date;
  lawyerId: string;
  caseId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  billable: boolean;
  rate: number;
  serviceType?: ServiceType;
  needsFollowUp: boolean;
  followUpNotes?: string | null;
  outreachLocation?: string | null;
  case?: {
    id: string;
    title: string;
    status: string;
  };
} 