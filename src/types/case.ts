export type CaseStatus = "ACTIVE" | "PENDING" | "CLOSED" | "ON_HOLD";
export type CasePriority = "HIGH" | "MEDIUM" | "LOW";

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
} 