export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DISABLED = 'DISABLED',
  CHRONIC_ILLNESS = 'CHRONIC_ILLNESS',
  OTHER = 'OTHER'
}

export interface ClientProfile {
  id: string;
  userId: string;
  age: number;
  sex: Gender;
  phone: string;
  numberOfFamily: number;
  healthStatus: HealthStatus;
  region: string;
  zone: string;
  wereda: string;
  kebele: string;
  houseNumber?: string;
  caseType: string;
  caseCategory: string;
  officeId: string;
  guidelines: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 