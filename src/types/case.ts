export type CaseStatus = "ACTIVE" | "PENDING" | "CLOSED" | "ON_HOLD";
export type CasePriority = "HIGH" | "MEDIUM" | "LOW";

export enum CaseType {
  CIVIL = 'CIVIL',
  CRIMINAL = 'CRIMINAL',
  FAMILY = 'FAMILY',
  PROPERTY = 'PROPERTY',
  LABOR = 'LABOR',
  COMMERCIAL = 'COMMERCIAL',
  CONSTITUTIONAL = 'CONSTITUTIONAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  OTHER = 'OTHER'
}

export enum CaseCategory {
  FAMILY = 'FAMILY',
  CRIMINAL = 'CRIMINAL',
  CIVIL = 'CIVIL',
  PROPERTY = 'PROPERTY',
  LABOR = 'LABOR',
  COMMERCIAL = 'COMMERCIAL',
  CONSTITUTIONAL = 'CONSTITUTIONAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  OTHER = 'OTHER'
}

export interface CaseDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  status: CaseStatus;
  priority: CasePriority;
  dueDate: Date;
  practiceArea: string;
  nextHearing: Date;
  assignedTeam: string[];
  description: string;
  documents: CaseDocument[];
  category: CaseCategory;
  type: CaseType;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  clientId: string;
  lawyerId?: string;
  officeId: string;
} 