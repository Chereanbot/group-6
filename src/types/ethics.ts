export interface EthicsRequirement {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'completed' | 'pending' | 'overdue';
  category: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'completed' | 'in-progress' | 'not-started';
  completionDate?: Date;
  expiryDate?: Date;
}

export interface Certification {
  id: string;
  name: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'pending';
  issuingAuthority: string;
  documentUrl?: string;
} 