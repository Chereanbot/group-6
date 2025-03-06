export interface ClientProfile {
  region?: string;
  zone?: string;
  wereda?: string;
  kebele?: string;
  caseType?: string;
  caseCategory?: string;
}

export interface Client {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  clientProfile?: ClientProfile;
}

export interface Coordinator {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  client: Client;
  coordinator: Coordinator;
  scheduledTime: string;
  duration: number;
  purpose: string;
  status: string;
  notes?: string;
  caseType: string;
  venue?: string;
  priority: string;
  requiredDocuments: string[];
  reminderType: string[];
  reminderTiming: number[];
} 