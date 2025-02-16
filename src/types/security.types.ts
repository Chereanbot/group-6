export enum SecurityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum UserSecurityRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export enum SettingCategory {
  GENERAL = 'GENERAL',
  SITE = 'SITE',
  EMAIL = 'EMAIL',
  NOTIFICATIONS = 'NOTIFICATIONS',
  SECURITY = 'SECURITY',
  DATABASE = 'DATABASE',
  API = 'API',
  TEMPLATES = 'TEMPLATES',
  APPEARANCE = 'APPEARANCE',
  LOCALIZATION = 'LOCALIZATION',
  BACKUP = 'BACKUP'
}

export interface SecurityRequirement {
  level: SecurityLevel;
  roles: UserSecurityRole[];
  twoFactorRequired?: boolean;
  ipRestricted?: boolean;
}

export interface SettingSecurity {
  category: SettingCategory;
  requirement: SecurityRequirement;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  category: SettingCategory;
  changes: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
} 