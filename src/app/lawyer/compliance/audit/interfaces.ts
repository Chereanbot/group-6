export interface AuditRecord {
  id: string;
  type: AuditType;
  status: AuditStatus;
  priority: AuditPriority;
  category: AuditCategory;
  description: string;
  findings?: string;
  recommendations?: string;
  dueDate: Date;
  completedDate?: Date;
  assignedTo: {
    id: string;
    name: string;
    role: string;
  };
  documents: AuditDocument[];
  comments: AuditComment[];
  createdAt: Date;
  updatedAt: Date;
  metadata: AuditMetadata;
}

export type AuditType = 
  | 'INTERNAL'
  | 'EXTERNAL'
  | 'REGULATORY'
  | 'CLIENT'
  | 'FINANCIAL'
  | 'OPERATIONAL';

export type AuditStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'REQUIRES_REVIEW'
  | 'NON_COMPLIANT';

export type AuditPriority = 
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type AuditCategory =
  | 'CASE_MANAGEMENT'
  | 'CLIENT_CONFIDENTIALITY'
  | 'DOCUMENT_RETENTION'
  | 'FINANCIAL_COMPLIANCE'
  | 'ETHICS'
  | 'DATA_PROTECTION'
  | 'PROFESSIONAL_CONDUCT';

export interface AuditDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
}

export interface AuditComment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export interface AuditMetadata {
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  impact?: 'SEVERE' | 'MODERATE' | 'MINOR';
  scope?: string[];
  relatedCases?: string[];
  reviewers?: string[];
  complianceFrameworks?: string[];
} 