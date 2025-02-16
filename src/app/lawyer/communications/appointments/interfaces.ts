export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  priority: AppointmentPriority;
  
  // Relations
  clientId: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  caseId?: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
  };
  
  // Metadata
  notes?: string;
  documents?: AppointmentDocument[];
  reminders: AppointmentReminder[];
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus = 
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type AppointmentType =
  | 'CONSULTATION'
  | 'CASE_REVIEW'
  | 'COURT_PREPARATION'
  | 'CLIENT_MEETING'
  | 'DEPOSITION'
  | 'MEDIATION'
  | 'OTHER';

export type AppointmentPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AppointmentDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface AppointmentReminder {
  id: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
} 