export interface LegalResource {
  id: string;
  title: string;
  category: string;
  description?: string;
  url: string;
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
  credentials?: ResourceCredentials;
  attachments?: ResourceAttachment[];
  analytics?: ResourceAnalytics[];
  shares?: ResourceShare[];
}

export interface ResourceCredentials {
  id: string;
  username?: string;
  password?: string;
}

export interface ResourceAttachment {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  createdAt: Date;
}

export interface ResourceShare {
  id: string;
  sharedWith: {
    id: string;
    email: string;
    fullName: string;
  };
  permissions: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface ResourceAnalytics {
  id: string;
  action: ResourceAction;
  metadata?: any;
  createdAt: Date;
}

export type ResourceAction = 
  | 'VIEW' 
  | 'DOWNLOAD' 
  | 'EDIT' 
  | 'SHARE' 
  | 'FAVORITE' 
  | 'UNFAVORITE';

export interface ResourceTab {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  filter: (resources: LegalResource[]) => LegalResource[];
} 