import { Priority } from '@prisma/client';

export interface KebeleDetails {
  kebeleNumber: string;
  kebeleName: string;
  manager: {
    fullName: string;
    phone: string;
    email?: string;
  };
  mainOffice?: string;
  population?: number;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface RequestDetails {
  questions: QuestionAnswer[];
  additionalNotes: string;
}

export interface DocumentInfo {
  id?: string;
  name?: string;
  type?: string;
  size?: number;
  url?: string;
  file?: File;
  category?: string;
  uploadDate?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AssignmentDetails {
  assignedLawyer?: string;
  assignedOffice?: string;
  officeId?: string;
  assignmentNotes?: string;
  assignmentDate?: string;
  priority?: string;
}

export interface CaseFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  region: string;
  zone: string;
  wereda: string;
  kebele: string;
  houseNumber: string;
  kebeleDetails: KebeleDetails;
  caseType: string;
  caseDescription: string;
  caseDate?: string;
  expectedResolutionDate?: string;
  tags: string[];
  documents: DocumentInfo[];
  clientRequest: string;
  requestDetails: RequestDetails;
  documentNotes?: string;
  documentChecklist?: Record<number, boolean>;
  assignmentDetails?: AssignmentDetails;
} 