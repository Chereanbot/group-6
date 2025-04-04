import prisma from '@/lib/prisma';
import { CoordinatorHistoryAction, Prisma } from '@prisma/client';

interface CreateHistoryEntryParams {
  coordinatorId: string;
  action: CoordinatorHistoryAction;
  changeDetails: string;
  previousValue?: any;
  newValue?: any;
  context?: any;
  metadata?: any;
  clientId?: string;
  caseId?: string;
  lawyerId?: string;
  officeId?: string;
  documentId?: string;
  appointmentId?: string;
  serviceRequestId?: string;
}

export async function createHistoryEntry({
  coordinatorId,
  action,
  changeDetails,
  previousValue,
  newValue,
  context,
  metadata,
  clientId,
  caseId,
  lawyerId,
  officeId,
  documentId,
  appointmentId,
  serviceRequestId
}: CreateHistoryEntryParams) {
  try {
    const historyEntry = await prisma.coordinatorHistory.create({
      data: {
        coordinator: {
          connect: { id: coordinatorId }
        },
        action,
        changeDetails,
        previousValue,
        newValue,
        context,
        metadata,
        changedBy: coordinatorId,
        ...(clientId && { client: { connect: { id: clientId } } }),
        ...(caseId && { case: { connect: { id: caseId } } }),
        ...(lawyerId && { lawyer: { connect: { id: lawyerId } } }),
        ...(officeId && { office: { connect: { id: officeId } } }),
        ...(documentId && { document: { connect: { id: documentId } } }),
        ...(appointmentId && { appointment: { connect: { id: appointmentId } } }),
        ...(serviceRequestId && { serviceRequest: { connect: { id: serviceRequestId } } })
      }
    });

    return historyEntry;
  } catch (error) {
    console.error('Error creating history entry:', error);
    throw error;
  }
}

export function formatChangeDetails(
  action: CoordinatorHistoryAction,
  previousValue: any,
  newValue: any,
  customDetails?: string
): string {
  if (customDetails) return customDetails;

  switch (action) {
    case 'CLIENT_ASSIGNED':
      return `Assigned client ${newValue?.fullName || 'Unknown'}`;
    case 'CASE_ASSIGNED':
      return `Assigned case "${newValue?.title || 'Unknown'}"`;
    case 'DOCUMENT_UPLOADED':
      return `Uploaded document "${newValue?.title || 'Unknown'}"`;
    case 'APPOINTMENT_SCHEDULED':
      return `Scheduled appointment for ${new Date(newValue?.startTime).toLocaleString()}`;
    case 'CLIENT_STATUS_CHANGED':
      return `Changed client status from "${previousValue?.status || 'Unknown'}" to "${newValue?.status || 'Unknown'}"`;
    case 'CASE_STATUS_CHANGED':
      return `Changed case status from "${previousValue?.status || 'Unknown'}" to "${newValue?.status || 'Unknown'}"`;
    case 'LAWYER_ASSIGNED':
      return `Assigned lawyer ${newValue?.fullName || 'Unknown'}`;
    case 'SERVICE_REQUEST_CREATED':
      return `Created service request "${newValue?.title || 'Unknown'}"`;
    default:
      return 'Action performed';
  }
}

export function getActionFromEntityType(entityType: string): CoordinatorHistoryAction {
  switch (entityType.toLowerCase()) {
    case 'client':
      return 'CLIENT_ASSIGNED';
    case 'case':
      return 'CASE_ASSIGNED';
    case 'document':
      return 'DOCUMENT_UPLOADED';
    case 'appointment':
      return 'APPOINTMENT_SCHEDULED';
    case 'lawyer':
      return 'LAWYER_ASSIGNED';
    case 'service':
      return 'SERVICE_REQUEST_CREATED';
    default:
      return 'OTHER';
  }
}

export function getEntityTypeFromAction(action: CoordinatorHistoryAction): string {
  switch (action) {
    case 'CLIENT_ASSIGNED':
      return 'client';
    case 'CASE_ASSIGNED':
      return 'case';
    case 'DOCUMENT_UPLOADED':
      return 'document';
    case 'APPOINTMENT_SCHEDULED':
      return 'appointment';
    case 'LAWYER_ASSIGNED':
      return 'lawyer';
    case 'SERVICE_REQUEST_CREATED':
      return 'service';
    default:
      return 'other';
  }
} 