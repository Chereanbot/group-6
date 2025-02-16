import { UserRoleEnum, UserStatus } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  userRole: UserRoleEnum;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  status: UserStatus;
  password?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export enum CaseCategory {
  FAMILY = 'FAMILY',
  CRIMINAL = 'CRIMINAL',
  CIVIL = 'CIVIL',
  PROPERTY = 'PROPERTY',
  LABOR = 'LABOR',
  COMMERCIAL = 'COMMERCIAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE'
}

export enum CaseStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum FamilyCaseType {
  DIVORCE = 'DIVORCE',
  CUSTODY = 'CUSTODY',
  ADOPTION = 'ADOPTION',
  INHERITANCE = 'INHERITANCE',
  MARRIAGE = 'MARRIAGE',
  OTHER = 'OTHER'
}

export enum CriminalCaseType {
  ASSAULT = 'ASSAULT',
  THEFT = 'THEFT',
  FRAUD = 'FRAUD',
  HOMICIDE = 'HOMICIDE',
  DRUG_RELATED = 'DRUG_RELATED',
  OTHER = 'OTHER'
}

export enum CivilCaseType {
  CONTRACT = 'CONTRACT',
  TORT = 'TORT',
  DEFAMATION = 'DEFAMATION',
  NEGLIGENCE = 'NEGLIGENCE',
  OTHER = 'OTHER'
}

export enum PropertyCaseType {
  LAND_DISPUTE = 'LAND_DISPUTE',
  REAL_ESTATE = 'REAL_ESTATE',
  TENANT = 'TENANT',
  OWNERSHIP = 'OWNERSHIP',
  OTHER = 'OTHER'
}

export enum LaborCaseType {
  WRONGFUL_TERMINATION = 'WRONGFUL_TERMINATION',
  DISCRIMINATION = 'DISCRIMINATION',
  COMPENSATION = 'COMPENSATION',
  WORKPLACE_SAFETY = 'WORKPLACE_SAFETY',
  OTHER = 'OTHER'
}

export enum CommercialCaseType {
  BUSINESS_DISPUTE = 'BUSINESS_DISPUTE',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  TRADE_SECRETS = 'TRADE_SECRETS',
  BANKRUPTCY = 'BANKRUPTCY',
  OTHER = 'OTHER'
}

export enum AdministrativeCaseType {
  LICENSING = 'LICENSING',
  PERMITS = 'PERMITS',
  REGULATORY = 'REGULATORY',
  TAX = 'TAX',
  OTHER = 'OTHER'
} 