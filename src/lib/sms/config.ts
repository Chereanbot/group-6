// SMS Configuration and Utilities

// Rate limiting configuration
export const RATE_LIMITS = {
  MAX_SMS_PER_MINUTE: 10,
  MAX_SMS_PER_HOUR: 50,
  MAX_SMS_PER_DAY: 200,
  COOLDOWN_MINUTES: 5
};

// Phone number validation and formatting
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove any spaces, dashes, or other characters
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Allow any phone number that has 9-13 digits
  return /^\+?\d{9,13}$/.test(cleanPhone);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If phone starts with 0, replace with +251
  if (cleanPhone.startsWith('0')) {
    return '+251' + cleanPhone.slice(1);
  }
  
  // If phone doesn't start with +, add it
  if (!cleanPhone.startsWith('+')) {
    return '+' + cleanPhone;
  }
  
  return cleanPhone;
};

// SMS Provider Configuration
export const SMS_PROVIDER_CONFIG = {
  // Replace these with your actual SMS provider credentials
  apiKey: process.env.SMS_PROVIDER_API_KEY || '',
  apiSecret: process.env.SMS_PROVIDER_API_SECRET || '',
  senderId: process.env.SMS_SENDER_ID || 'YourApp',
  baseUrl: process.env.SMS_PROVIDER_BASE_URL || 'https://api.yoursmsprovier.com',
  endpoints: {
    send: '/v1/messages',
    status: '/v1/status',
    balance: '/v1/balance'
  }
};

// Message Templates
export const MESSAGE_TEMPLATES = {
  VERIFICATION: 'Your verification code is: {{code}}. Valid for {{minutes}} minutes.',
  APPOINTMENT_REMINDER: 'Reminder: Your appointment is scheduled for {{date}} at {{time}}.',
  DOCUMENT_READY: 'Your document {{documentName}} is ready for collection.',
  CASE_UPDATE: 'Update on your case {{caseNumber}}: {{status}}',
  PAYMENT_CONFIRMATION: 'Payment of ETB {{amount}} received. Thank you!',
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_PHONE: 'Invalid phone number format',
  RATE_LIMIT_EXCEEDED: 'SMS rate limit exceeded. Please try again later.',
  SENDING_FAILED: 'Failed to send SMS. Please try again.',
  PROVIDER_ERROR: 'SMS provider error:',
};

// SMS Status Types
export const SMS_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED'
} as const;

// Utility function to replace template variables
export const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
};

// SMS Queue Configuration
export const QUEUE_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  BATCH_SIZE: 100,
  PROCESSING_INTERVAL: 1000 // 1 second
};

// Message Priority Levels
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
} as const;

// Export types
export type SmsStatus = typeof SMS_STATUS[keyof typeof SMS_STATUS];
export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS]; 