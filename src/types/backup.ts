export type CompressionLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type BackupFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type BackupType = 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export interface BackupSettings {
  id?: string;
  compression: CompressionLevel;
  encryption: boolean;
  excludedPaths: string[];
  maxConcurrent: number;
}

export interface BackupSchedule {
  enabled: boolean;
  frequency: BackupFrequency;
  timeOfDay: string;
}

export interface Backup {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  size?: number;
  createdAt: string;
  completedAt?: string;
  settings?: BackupSettings;
} 