import { prisma } from '@/lib/prisma';
import { CoordinatorHistoryAction } from '@prisma/client';

interface RecordHistoryParams {
  coordinatorId: string;
  action: CoordinatorHistoryAction;
  changedBy: string;
  previousValue?: any;
  newValue?: any;
  changeDetails?: string;
  clientId?: string;
  caseId?: string;
  officeId?: string;
  lawyerId?: string;
  projectId?: string;
  documentId?: string;
  appointmentId?: string;
  serviceRequestId?: string;
  messageId?: string;
  context?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordCoordinatorAction({
  coordinatorId,
  action,
  changedBy,
  previousValue,
  newValue,
  changeDetails,
  clientId,
  caseId,
  officeId,
  lawyerId,
  projectId,
  documentId,
  appointmentId,
  serviceRequestId,
  messageId,
  context,
  metadata,
  ipAddress,
  userAgent
}: RecordHistoryParams) {
  try {
    const historyEntry = await prisma.coordinatorHistory.create({
      data: {
        coordinatorId,
        action,
        changedBy,
        previousValue: previousValue ? JSON.stringify(previousValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        changeDetails,
        clientId,
        caseId,
        officeId,
        lawyerId,
        projectId,
        documentId,
        appointmentId,
        serviceRequestId,
        messageId,
        context: context ? JSON.stringify(context) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent
      }
    });

    return historyEntry;
  } catch (error) {
    console.error('Failed to record coordinator action:', error);
    throw error;
  }
}

// Helper function to format history entry for display
export function formatHistoryEntry(entry: any) {
  const actionLabels: Record<CoordinatorHistoryAction, string> = {
    PROFILE_UPDATE: 'Updated profile',
    STATUS_CHANGE: 'Changed status',
    OFFICE_ASSIGNMENT: 'Assigned to office',
    QUALIFICATION_ADDED: 'Added qualification',
    QUALIFICATION_UPDATED: 'Updated qualification',
    QUALIFICATION_REMOVED: 'Removed qualification',
    DOCUMENT_ADDED: 'Added document',
    PROJECT_ASSIGNED: 'Assigned to project',
    PROJECT_UNASSIGNED: 'Unassigned from project',
    PROJECT_STATUS_CHANGED: 'Changed project status',
    PROJECT_UPDATED: 'Updated project',
    SPECIALTY_ADDED: 'Added specialty',
    SPECIALTY_REMOVED: 'Removed specialty',
    TEMPLATE_CREATED: 'Created template',
    TEMPLATE_UPDATED: 'Updated template',
    TEMPLATE_DELETED: 'Deleted template',
    INSTRUCTION_ADDED: 'Added instruction',
    INSTRUCTION_UPDATED: 'Updated instruction',
    INSTRUCTION_REMOVED: 'Removed instruction',
    CLIENT_ASSIGNED: 'Assigned client',
    CLIENT_UNASSIGNED: 'Unassigned client',
    CLIENT_STATUS_CHANGED: 'Changed client status',
    CLIENT_DOCUMENT_ADDED: 'Added client document',
    CLIENT_DOCUMENT_REMOVED: 'Removed client document',
    CLIENT_PROFILE_UPDATED: 'Updated client profile',
    CASE_ASSIGNED: 'Assigned case',
    CASE_UNASSIGNED: 'Unassigned case',
    CASE_STATUS_CHANGED: 'Changed case status',
    CASE_DOCUMENT_ADDED: 'Added case document',
    CASE_DOCUMENT_REMOVED: 'Removed case document',
    CASE_NOTE_ADDED: 'Added case note',
    CASE_NOTE_UPDATED: 'Updated case note',
    CASE_NOTE_DELETED: 'Deleted case note',
    LAWYER_ASSIGNED: 'Assigned lawyer',
    LAWYER_UNASSIGNED: 'Unassigned lawyer',
    LAWYER_STATUS_CHANGED: 'Changed lawyer status',
    LAWYER_WORKLOAD_UPDATED: 'Updated lawyer workload',
    LAWYER_PERFORMANCE_UPDATED: 'Updated lawyer performance',
    SERVICE_REQUEST_CREATED: 'Created service request',
    SERVICE_REQUEST_UPDATED: 'Updated service request',
    SERVICE_REQUEST_STATUS_CHANGED: 'Changed service request status',
    SERVICE_REQUEST_ASSIGNED: 'Assigned service request',
    SERVICE_REQUEST_UNASSIGNED: 'Unassigned service request',
    APPOINTMENT_SCHEDULED: 'Scheduled appointment',
    APPOINTMENT_UPDATED: 'Updated appointment',
    APPOINTMENT_CANCELLED: 'Cancelled appointment',
    APPOINTMENT_RESCHEDULED: 'Rescheduled appointment',
    APPOINTMENT_COMPLETED: 'Completed appointment',
    MESSAGE_SENT: 'Sent message',
    MESSAGE_UPDATED: 'Updated message',
    MESSAGE_DELETED: 'Deleted message',
    NOTIFICATION_SENT: 'Sent notification',
    NOTIFICATION_UPDATED: 'Updated notification',
    DOCUMENT_UPLOADED: 'Uploaded document',
    DOCUMENT_DOWNLOADED: 'Downloaded document',
    DOCUMENT_SHARED: 'Shared document',
    DOCUMENT_REMOVED: 'Removed document',
    DOCUMENT_STATUS_CHANGED: 'Changed document status',
    OFFICE_ASSIGNED: 'Assigned to office',
    OFFICE_UNASSIGNED: 'Unassigned from office',
    OFFICE_STATUS_CHANGED: 'Changed office status',
    OFFICE_RESOURCE_ASSIGNED: 'Assigned office resource',
    OFFICE_RESOURCE_UNASSIGNED: 'Unassigned office resource',
    SETTINGS_UPDATED: 'Updated settings',
    PREFERENCES_CHANGED: 'Changed preferences',
    OTHER: 'Other action'
  };

  return {
    ...entry,
    actionLabel: actionLabels[entry.action] || 'Unknown action',
    formattedDate: new Date(entry.changedAt).toLocaleString(),
    previousValue: entry.previousValue ? JSON.parse(entry.previousValue) : null,
    newValue: entry.newValue ? JSON.parse(entry.newValue) : null,
    context: entry.context ? JSON.parse(entry.context) : null,
    metadata: entry.metadata ? JSON.parse(entry.metadata) : null
  };
} 