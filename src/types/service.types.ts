import { ServiceType as PrismaServiceType, PaymentStatus as PrismaPaymentStatus, Priority } from '@prisma/client';

// Define our own ServiceStatus enum since it's not in @prisma/client
export enum ServiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Re-export Prisma types with our own names
export type ServiceType = PrismaServiceType;
export type PaymentStatus = PrismaPaymentStatus;

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