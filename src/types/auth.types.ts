export interface Permission {
  id: string;
  name: string;
  description?: string;
  module?: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
} 