import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum, CaseStatus, CaseCategory, Priority, NotificationType, CoordinatorStatus } from '@prisma/client';

// Validation constants
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_EVIDENCE_DESC_LENGTH = 1000;
const MAX_URGENCY_REASON_LENGTH = 1000;
const MAX_ADDITIONAL_NOTES_LENGTH = 1000;
const MAX_DOCUMENTS = 10;

// Helper function to validate case registration data
async function validateCaseData(data: any) {
  const errors: string[] = [];

  // Required field checks
  if (!data.title?.trim()) errors.push("Title is required");
  if (!data.category) errors.push("Category is required");
  if (!data.priority) errors.push("Priority is required");
  if (!data.description?.trim()) errors.push("Description is required");
  if (!data.incidentDate) errors.push("Incident date is required");
  if (!data.location?.trim()) errors.push("Location is required");
  if (!data.officeId) errors.push("Office ID is required");

  // Length validations
  if (data.title?.length > MAX_TITLE_LENGTH) 
    errors.push(`Title must not exceed ${MAX_TITLE_LENGTH} characters`);
  if (data.description?.length > MAX_DESCRIPTION_LENGTH) 
    errors.push(`Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`);
  if (data.evidenceDescription?.length > MAX_EVIDENCE_DESC_LENGTH) 
    errors.push(`Evidence description must not exceed ${MAX_EVIDENCE_DESC_LENGTH} characters`);
  if (data.urgencyReason?.length > MAX_URGENCY_REASON_LENGTH) 
    errors.push(`Urgency reason must not exceed ${MAX_URGENCY_REASON_LENGTH} characters`);
  if (data.additionalNotes?.length > MAX_ADDITIONAL_NOTES_LENGTH) 
    errors.push(`Additional notes must not exceed ${MAX_ADDITIONAL_NOTES_LENGTH} characters`);

  // Date validation
  const incidentDate = new Date(data.incidentDate);
  const now = new Date();
  if (isNaN(incidentDate.getTime())) {
    errors.push("Invalid incident date format");
  } else if (incidentDate > now) {
    errors.push("Incident date cannot be in the future");
  }

  // Category validation
  if (data.category && !Object.values(CaseCategory).includes(data.category)) {
    errors.push("Invalid case category");
  }

  // Priority validation
  if (data.priority && !Object.values(Priority).includes(data.priority)) {
    errors.push("Invalid priority level");
  }

  // Document validation
  if (data.documentIds && data.documentIds.length > MAX_DOCUMENTS) {
    errors.push(`Cannot upload more than ${MAX_DOCUMENTS} documents`);
  }

  // Office validation
  if (data.officeId) {
    const office = await prisma.office.findUnique({
      where: { id: data.officeId }
    });
    if (!office) {
      errors.push("Invalid office selected");
    }
  }

  return errors;
}

// Helper function to get coordinator's current workload
async function getCoordinatorWorkload(coordinatorId: string): Promise<number> {
  const activeCases = await prisma.caseAssignment.count({
    where: {
      assignedToId: coordinatorId,
      status: 'PENDING',
    }
  });
  return activeCases;
}

// Helper function to find coordinator with least workload in an office
async function findLeastLoadedCoordinator(officeId: string) {
  // Get all active coordinators in the office
  const coordinators = await prisma.coordinator.findMany({
    where: {
      officeId,
      status: CoordinatorStatus.ACTIVE,
      user: {
        status: 'ACTIVE'
      }
    },
    include: {
      user: true
    }
  });

  if (!coordinators.length) {
    return null;
  }

  // Get workload for each coordinator
  const workloads = await Promise.all(
    coordinators.map(async (coordinator) => {
      const caseCount = await getCoordinatorWorkload(coordinator.userId);
      return {
        coordinator,
        caseCount
      };
    })
  );

  // Find coordinator with minimum workload
  const leastLoaded = workloads.reduce((min, current) => 
    current.caseCount < min.caseCount ? current : min
  , workloads[0]);

  return leastLoaded.coordinator;
}

// Helper function to check if user has active cases
async function hasActiveCases(userId: string): Promise<boolean> {
  const activeCases = await prisma.case.count({
    where: {
      clientId: userId,
      status: {
        in: ['ACTIVE', 'PENDING']
      }
    }
  });
  return activeCases > 0;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has an active or pending case
    const hasActive = await hasActiveCases(user.id);
    if (hasActive) {
      return NextResponse.json(
        { 
          success: false, 
          message: "You already have an active or pending case. You can only register a new case after your current case is closed or deleted.",
          code: "ACTIVE_CASE_EXISTS"
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate the case data
    const validationErrors = await validateCaseData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed", 
          errors: validationErrors,
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      );
    }

    const {
      title,
      category,
      priority,
      description,
      incidentDate,
      location,
      evidenceDescription,
      urgencyReason,
      additionalNotes,
      documentIds = [],
      officeId
    } = body;

    // Get user's profile for location details
    const userProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: {
        region: true,
        zone: true,
        wereda: true,
        kebele: true,
        houseNumber: true,
        phone: true
      }
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: "User profile not found" },
        { status: 400 }
      );
    }

    // Create the case with basic info
    const newCase = await prisma.case.create({
      data: {
        title,
        category: category as CaseCategory,
        priority: priority as Priority,
        description,
        status: CaseStatus.PENDING,
        clientId: user.id,
        clientName: user.fullName,
        clientPhone: userProfile.phone,
        region: userProfile.region,
        zone: userProfile.zone,
        wereda: userProfile.wereda,
        kebele: userProfile.kebele,
        houseNumber: userProfile.houseNumber || '',
        clientRequest: description,
        requestDetails: {
          incidentDate: new Date(incidentDate),
          location,
          evidenceDescription,
          urgencyReason,
          additionalNotes
        },
        officeId // Assign to specified office
      }
    });

    // Link documents to the case if any
    if (documentIds.length > 0) {
      const documents = await prisma.document.findMany({
        where: {
          id: {
            in: documentIds
          }
        }
      });

      if (documents.length > 0) {
        await prisma.caseDocument.createMany({
          data: documents.map(doc => ({
            caseId: newCase.id,
            title: doc.title,
            type: doc.type,
            path: doc.path,
            size: doc.size,
            mimeType: doc.mimeType,
            uploadedBy: user.id,
            uploadedAt: new Date()
          }))
        });

        await prisma.caseActivity.create({
          data: {
            caseId: newCase.id,
            userId: user.id,
            title: 'Documents Uploaded',
            description: `${documents.length} document(s) uploaded`,
            type: 'DOCUMENT_UPLOAD'
          }
        });
      }
    }

    // Find coordinator with least workload in the office
    const coordinator = await findLeastLoadedCoordinator(officeId);
    
    if (coordinator) {
      // Create case assignment for coordinator
      await prisma.caseAssignment.create({
        data: {
          caseId: newCase.id,
          assignedById: user.id,
          assignedToId: coordinator.userId,
          status: 'PENDING'
        }
      });

      // Add assignment activity
      await prisma.caseActivity.create({
        data: {
          caseId: newCase.id,
          userId: user.id,
          title: 'Coordinator Assigned',
          description: `Case assigned to coordinator ${coordinator.user.fullName}`,
          type: 'COORDINATOR_ASSIGNED'
        }
      });

      // Notify the assigned coordinator
      await prisma.notification.create({
        data: {
          userId: coordinator.userId,
          title: 'New Case Assigned',
          message: `You have been assigned to case "${title}"`,
          type: NotificationType.TASK_ASSIGNED,
          status: 'UNREAD',
          metadata: {
            caseId: newCase.id,
            caseTitle: title
          }
        }
      });
    } else {
      // Log if no coordinator is available
      await prisma.caseActivity.create({
        data: {
          caseId: newCase.id,
          userId: user.id,
          title: 'Coordinator Assignment Failed',
          description: 'No active coordinator available in the office',
          type: 'ASSIGNMENT_FAILED'
        }
      });
    }

    // Create notification for the client
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Case Registered Successfully',
        message: `Your case "${title}" has been registered and is under review.`,
        type: NotificationType.SYSTEM_UPDATE,
        status: 'UNREAD',
        metadata: {
          caseId: newCase.id,
          caseTitle: title
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newCase.id,
        message: 'Case registered successfully',
        coordinatorAssigned: !!coordinator
      }
    });

  } catch (error) {
    console.error('Error registering case:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to register case',
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
} 