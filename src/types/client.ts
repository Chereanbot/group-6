import { Gender, HealthStatus, CaseType, CaseCategory } from '@prisma/client';

interface User {
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
}

interface Specialization {
  id: string;
  specialization: {
    name: string;
  };
}

interface Lawyer {
  id: string;
  user: User;
  specializations: Specialization[];
}

interface Coordinator {
  id: string;
  user: User;
}

interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface Office {
  id: string;
  name: string;
  location: string;
  phone: string;
  coordinators: Coordinator[];
  lawyers: Lawyer[];
  cases?: Case[];
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
  caseType: CaseType;
  caseCategory: CaseCategory;
  guidelines: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  assignedOffice: Office;
} 