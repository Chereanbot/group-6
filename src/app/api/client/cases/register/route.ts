import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum, CaseStatus, CaseCategory, Priority, NotificationType } from '@prisma/client';

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

    const body = await request.json();
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
      documentIds = []
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
        }
      }
    });

    // Link documents to the case if any
    if (documentIds.length > 0) {
      // Get document details first
      const documents = await prisma.document.findMany({
        where: {
          id: {
            in: documentIds
          }
        }
      });

      if (documents.length > 0) {
        // Create case documents
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

        // Add document upload activity
        await prisma.caseActivity.create({
          data: {
            caseId: newCase.id,
            userId: user.id,
            title: 'Documents Uploaded',
            description: `${documents.length} document(s) uploaded`,
            type: 'DOCUMENT_UPLOAD'
          }
        });

        // Create notification for assigned lawyer
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: NotificationType.STATUS_UPDATE,
            title: 'New Case Created',
            message: `A new case "${title}" has been created with ${documents.length} document(s)`,
            status: 'UNREAD'
          }
        });
      }
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

    // Find available lawyer based on category and location
    const availableLawyer = await prisma.user.findFirst({
      where: {
        userRole: UserRoleEnum.LAWYER,
        status: 'ACTIVE',
        lawyerProfile: {
          specializations: {
            some: {
              specialization: {
                name: category
              }
            }
          },
          office: {
            location: {
              contains: location,
              mode: 'insensitive'
            }
          }
        }
      }
    });

    if (availableLawyer) {
      // Create case assignment
      await prisma.caseAssignment.create({
        data: {
          caseId: newCase.id,
          assignedById: user.id,
          assignedToId: availableLawyer.id,
          status: 'PENDING'
        }
      });

      // Add assignment activity
      await prisma.caseActivity.create({
        data: {
          caseId: newCase.id,
          userId: user.id,
          title: 'Lawyer Assigned',
          description: `Case assigned to ${availableLawyer.fullName}`,
          type: 'LAWYER_ASSIGNED'
        }
      });

      // Notify the assigned lawyer
      await prisma.notification.create({
        data: {
          userId: availableLawyer.id,
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
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newCase.id,
        message: 'Case registered successfully'
      }
    });

  } catch (error) {
    console.error('Error registering case:', error);
    return NextResponse.json(
      { error: 'Failed to register case' },
      { status: 500 }
    );
  }
} 