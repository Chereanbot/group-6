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

export enum UserRoleEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  COORDINATOR = 'COORDINATOR',
  CLIENT = 'CLIENT',
  PARALEGAL = 'PARALEGAL',
  ACCOUNTANT = 'ACCOUNTANT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED'
}

export enum PermissionModule {
  AUTH = 'AUTH',
  USERS = 'USERS',
  ROLES = 'ROLES',
  CASES = 'CASES',
  DOCUMENTS = 'DOCUMENTS',
  SETTINGS = 'SETTINGS',
  REPORTS = 'REPORTS',
  COMMUNICATIONS = 'COMMUNICATIONS',
  BILLING = 'BILLING',
  AUDIT = 'AUDIT',
  SERVICES = 'SERVICES',
  APPOINTMENTS = 'APPOINTMENTS'
}

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ASSIGN = 'ASSIGN',
  MANAGE = 'MANAGE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

export const DefaultPermissions = {
  // Authentication & Authorization
  AUTH_LOGIN: { module: PermissionModule.AUTH, action: 'LOGIN', description: 'Ability to login to the system' },
  AUTH_VERIFY: { module: PermissionModule.AUTH, action: 'VERIFY', description: 'Verify user accounts' },
  AUTH_RESET_PASSWORD: { module: PermissionModule.AUTH, action: 'RESET_PASSWORD', description: 'Reset user passwords' },

  // User Management
  USERS_CREATE: { module: PermissionModule.USERS, action: PermissionAction.CREATE, description: 'Create new users' },
  USERS_VIEW: { module: PermissionModule.USERS, action: PermissionAction.READ, description: 'View user details' },
  USERS_UPDATE: { module: PermissionModule.USERS, action: PermissionAction.UPDATE, description: 'Update user information' },
  USERS_DELETE: { module: PermissionModule.USERS, action: PermissionAction.DELETE, description: 'Delete users' },
  USERS_MANAGE: { module: PermissionModule.USERS, action: PermissionAction.MANAGE, description: 'Manage user settings and status' },

  // Role Management
  ROLES_CREATE: { module: PermissionModule.ROLES, action: PermissionAction.CREATE, description: 'Create new roles' },
  ROLES_VIEW: { module: PermissionModule.ROLES, action: PermissionAction.READ, description: 'View roles and permissions' },
  ROLES_UPDATE: { module: PermissionModule.ROLES, action: PermissionAction.UPDATE, description: 'Update roles' },
  ROLES_DELETE: { module: PermissionModule.ROLES, action: PermissionAction.DELETE, description: 'Delete roles' },
  ROLES_ASSIGN: { module: PermissionModule.ROLES, action: PermissionAction.ASSIGN, description: 'Assign roles to users' },

  // Case Management
  CASES_CREATE: { module: PermissionModule.CASES, action: PermissionAction.CREATE, description: 'Create new cases' },
  CASES_VIEW: { module: PermissionModule.CASES, action: PermissionAction.READ, description: 'View case details' },
  CASES_UPDATE: { module: PermissionModule.CASES, action: PermissionAction.UPDATE, description: 'Update case information' },
  CASES_DELETE: { module: PermissionModule.CASES, action: PermissionAction.DELETE, description: 'Delete cases' },
  CASES_ASSIGN: { module: PermissionModule.CASES, action: PermissionAction.ASSIGN, description: 'Assign cases to lawyers' },
  CASES_APPROVE: { module: PermissionModule.CASES, action: PermissionAction.APPROVE, description: 'Approve case actions' },
  CASES_EXPORT: { module: PermissionModule.CASES, action: PermissionAction.EXPORT, description: 'Export case data' },

  // Document Management
  DOCUMENTS_CREATE: { module: PermissionModule.DOCUMENTS, action: PermissionAction.CREATE, description: 'Create/upload documents' },
  DOCUMENTS_VIEW: { module: PermissionModule.DOCUMENTS, action: PermissionAction.READ, description: 'View documents' },
  DOCUMENTS_UPDATE: { module: PermissionModule.DOCUMENTS, action: PermissionAction.UPDATE, description: 'Update documents' },
  DOCUMENTS_DELETE: { module: PermissionModule.DOCUMENTS, action: PermissionAction.DELETE, description: 'Delete documents' },
  DOCUMENTS_APPROVE: { module: PermissionModule.DOCUMENTS, action: PermissionAction.APPROVE, description: 'Approve documents' },

  // Settings Management
  SETTINGS_VIEW: { module: PermissionModule.SETTINGS, action: PermissionAction.READ, description: 'View system settings' },
  SETTINGS_UPDATE: { module: PermissionModule.SETTINGS, action: PermissionAction.UPDATE, description: 'Update system settings' },

  // Report Management
  REPORTS_VIEW: { module: PermissionModule.REPORTS, action: PermissionAction.READ, description: 'View reports' },
  REPORTS_CREATE: { module: PermissionModule.REPORTS, action: PermissionAction.CREATE, description: 'Create reports' },
  REPORTS_EXPORT: { module: PermissionModule.REPORTS, action: PermissionAction.EXPORT, description: 'Export reports' },

  // Communication
  COMMUNICATIONS_SEND: { module: PermissionModule.COMMUNICATIONS, action: 'SEND', description: 'Send communications' },
  COMMUNICATIONS_VIEW: { module: PermissionModule.COMMUNICATIONS, action: PermissionAction.READ, description: 'View communications' },

  // Billing & Payments
  BILLING_CREATE: { module: PermissionModule.BILLING, action: PermissionAction.CREATE, description: 'Create billing records' },
  BILLING_VIEW: { module: PermissionModule.BILLING, action: PermissionAction.READ, description: 'View billing information' },
  BILLING_UPDATE: { module: PermissionModule.BILLING, action: PermissionAction.UPDATE, description: 'Update billing records' },
  BILLING_APPROVE: { module: PermissionModule.BILLING, action: PermissionAction.APPROVE, description: 'Approve payments' },

  // Audit Logs
  AUDIT_VIEW: { module: PermissionModule.AUDIT, action: PermissionAction.READ, description: 'View audit logs' },
  AUDIT_EXPORT: { module: PermissionModule.AUDIT, action: PermissionAction.EXPORT, description: 'Export audit logs' },

  // Services
  SERVICES_CREATE: { module: PermissionModule.SERVICES, action: PermissionAction.CREATE, description: 'Create services' },
  SERVICES_VIEW: { module: PermissionModule.SERVICES, action: PermissionAction.READ, description: 'View services' },
  SERVICES_UPDATE: { module: PermissionModule.SERVICES, action: PermissionAction.UPDATE, description: 'Update services' },
  SERVICES_DELETE: { module: PermissionModule.SERVICES, action: PermissionAction.DELETE, description: 'Delete services' },
  SERVICES_ASSIGN: { module: PermissionModule.SERVICES, action: PermissionAction.ASSIGN, description: 'Assign services' },

  // Appointments
  APPOINTMENTS_CREATE: { module: PermissionModule.APPOINTMENTS, action: PermissionAction.CREATE, description: 'Create appointments' },
  APPOINTMENTS_VIEW: { module: PermissionModule.APPOINTMENTS, action: PermissionAction.READ, description: 'View appointments' },
  APPOINTMENTS_UPDATE: { module: PermissionModule.APPOINTMENTS, action: PermissionAction.UPDATE, description: 'Update appointments' },
  APPOINTMENTS_DELETE: { module: PermissionModule.APPOINTMENTS, action: PermissionAction.DELETE, description: 'Delete appointments' },
  APPOINTMENTS_APPROVE: { module: PermissionModule.APPOINTMENTS, action: PermissionAction.APPROVE, description: 'Approve appointments' }
} as const;

export interface SecurityRequirement {
  level: SecurityLevel;
  roles: UserRoleEnum[];
  permissions?: string[];
  twoFactorRequired?: boolean;
  ipRestricted?: boolean;
}

export interface SettingSecurity {
  category: SettingCategory;
  requirement: SecurityRequirement;
}

export interface Permission {
  id: string;
  name: string;
  module: PermissionModule;
  action: PermissionAction | string;
  description: string;
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

export interface AccessControl {
  roles: Role[];
  permissions: Permission[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: PermissionModule;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Default role permissions mapping
export const DefaultRolePermissions = {
  SUPER_ADMIN: Object.keys(DefaultPermissions),
  ADMIN: [
    'AUTH_LOGIN', 'AUTH_VERIFY',
    'USERS_VIEW', 'USERS_UPDATE', 'USERS_MANAGE',
    'ROLES_VIEW', 'ROLES_ASSIGN',
    'CASES_VIEW', 'CASES_UPDATE', 'CASES_ASSIGN', 'CASES_MANAGE',
    'DOCUMENTS_VIEW', 'DOCUMENTS_UPDATE', 'DOCUMENTS_MANAGE',
    'SETTINGS_VIEW', 'SETTINGS_UPDATE',
    'REPORTS_VIEW', 'REPORTS_CREATE', 'REPORTS_EXPORT',
    'COMMUNICATIONS_VIEW', 'COMMUNICATIONS_SEND',
    'BILLING_VIEW', 'BILLING_UPDATE',
    'AUDIT_VIEW',
    'SERVICES_VIEW', 'SERVICES_UPDATE',
    'APPOINTMENTS_VIEW', 'APPOINTMENTS_UPDATE', 'APPOINTMENTS_MANAGE'
  ],
  LAWYER: [
    'AUTH_LOGIN',
    'CASES_VIEW', 'CASES_UPDATE', 'CASES_MANAGE',
    'DOCUMENTS_VIEW', 'DOCUMENTS_CREATE', 'DOCUMENTS_UPDATE',
    'COMMUNICATIONS_VIEW', 'COMMUNICATIONS_SEND',
    'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE', 'APPOINTMENTS_UPDATE',
    'REPORTS_VIEW', 'REPORTS_CREATE',
    'BILLING_VIEW', 'BILLING_CREATE'
  ],
  COORDINATOR: [
    'AUTH_LOGIN',
    'CASES_VIEW', 'CASES_UPDATE',
    'DOCUMENTS_VIEW',
    'COMMUNICATIONS_VIEW', 'COMMUNICATIONS_SEND',
    'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE', 'APPOINTMENTS_UPDATE',
    'SERVICES_VIEW'
  ],
  CLIENT: [
    'AUTH_LOGIN',
    'CASES_VIEW',
    'DOCUMENTS_VIEW',
    'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE',
    'COMMUNICATIONS_VIEW', 'COMMUNICATIONS_SEND',
    'BILLING_VIEW'
  ],
  PARALEGAL: [
    'AUTH_LOGIN',
    'CASES_VIEW',
    'DOCUMENTS_VIEW', 'DOCUMENTS_CREATE', 'DOCUMENTS_UPDATE',
    'COMMUNICATIONS_VIEW',
    'APPOINTMENTS_VIEW'
  ],
  ACCOUNTANT: [
    'AUTH_LOGIN',
    'BILLING_VIEW', 'BILLING_CREATE', 'BILLING_UPDATE', 'BILLING_APPROVE',
    'REPORTS_VIEW', 'REPORTS_CREATE', 'REPORTS_EXPORT'
  ]
}; 