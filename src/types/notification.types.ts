export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  serviceRequestId?: string;
  createdAt: Date;
  link?: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  icon?: string;
}

export type NotificationType = 
  | 'SERVICE_APPROVAL'
  | 'SERVICE_REJECTION'
  | 'DOCUMENT_VERIFICATION'
  | 'PAYMENT_CONFIRMATION'
  | 'APPOINTMENT_REMINDER'
  | 'MESSAGE'
  | 'SYSTEM';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  pushNotifications: boolean;
} 