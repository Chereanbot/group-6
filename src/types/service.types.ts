import { ServiceType, ServiceStatus, PaymentStatus, Priority } from '@prisma/client';

export enum ServiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ServiceType {
  LEGAL_AID = 'LEGAL_AID',
  PAID = 'PAID',
  CONSULTATION = 'CONSULTATION'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface ServiceRequest {
  id: string;
  type: ServiceType;
  status: ServiceStatus;
  clientId: string;
  client: {
    fullName: string;
    email: string;
  };
  lawyerId?: string;
  lawyer?: {
    fullName: string;
    email: string;
  };
  packageId?: string;
  package?: {
    name: string;
    price: number;
  };
  payment?: {
    status: PaymentStatus;
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDocument {
  id: string;
  title: string;
  type: string;
  path: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface IncomeProof {
  id: string;
  annualIncome: number;
  verified: boolean;
  verifiedAt?: Date;
  documents: ServiceDocument[];
}

export interface ServicePayment {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
}

export interface ServiceStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inProgress: number;
  completed: number;
  legalAid: number;
  paid: number;
  averageProcessingTime: number;
  satisfactionRate: number;
} 