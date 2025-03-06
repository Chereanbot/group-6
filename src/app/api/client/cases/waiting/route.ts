import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/edge-auth";
import prisma from "@/lib/prisma";
import { UserRoleEnum, CaseStatus, Priority, CaseCategory, DocumentStatus, DocumentType, Prisma } from "@prisma/client";
import { translateToAmharic } from "@/utils/translations";

const caseInclude = Prisma.validator<Prisma.CaseInclude>()({
  documents: true,
  activities: {
    orderBy: {
      createdAt: 'desc'
    },
    take: 5,
    include: {
      user: true
    }
  },
  assignedOffice: {
    include: {
      coordinators: {
        include: {
          user: true
        }
      }
    }
  },
  notes: {
    orderBy: {
      createdAt: 'desc'
    },
    take: 3,
    include: {
      creator: true
    }
  }
});

type CaseWithIncludes = Prisma.CaseGetPayload<{
  include: typeof caseInclude;
}>;

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    // Get the client's profile with all necessary information
    const clientProfile = await prisma.clientProfile.findUnique({
      where: {
        userId: payload.id
      },
      include: {
        user: true
      }
    });

    if (!clientProfile) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Client profile not found") },
        { status: 404 }
      );
    }

    // Fetch cases that are pending approval with related data
    const waitingCases = await prisma.case.findMany({
      where: {
        AND: [
          { status: CaseStatus.PENDING },
          { clientId: payload.id }
        ]
      },
      include: caseInclude,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include approval status and additional information
    const transformedCases = waitingCases.map((case_: CaseWithIncludes) => {
      // Since CaseDocument doesn't have a status field, we'll count all documents
      const totalDocuments = case_.documents.length;
      
      const documentStatus = {
        pending: totalDocuments, // Treat all documents as pending for now
        approved: 0,
        rejected: 0,
        total: totalDocuments,
        isComplete: false
      };

      const assignedCoordinator = case_.assignedOffice?.coordinators[0]?.user;

      return {
        id: case_.id,
        title: case_.title,
        description: case_.description,
        status: case_.status,
        createdAt: case_.createdAt,
        clientPhone: clientProfile.user.phone,
        documentStatus,
        documents: case_.documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          status: DocumentStatus.PENDING, // Default to pending since CaseDocument doesn't track status
          type: doc.type,
          createdAt: doc.uploadedAt,
          url: doc.path
        })),
        activities: case_.activities.map(activity => ({
          id: activity.id,
          action: activity.type,
          details: activity.description,
          createdAt: activity.createdAt,
          user: {
            fullName: activity.user.fullName
          }
        })),
        office: case_.assignedOffice ? {
          name: case_.assignedOffice.name,
          location: case_.assignedOffice.location,
          coordinator: assignedCoordinator ? {
            name: assignedCoordinator.fullName,
            email: assignedCoordinator.email
          } : null
        } : null,
        notes: case_.notes.map(note => ({
          id: note.id,
          content: note.content,
          createdAt: note.createdAt,
          createdBy: {
            fullName: note.creator.fullName
          }
        })),
        requiresAction: true // Since all documents are treated as pending
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedCases
    });
  } catch (error) {
    console.error("Error fetching waiting cases:", error);
    return NextResponse.json(
      { success: false, message: translateToAmharic("Failed to fetch cases") },
      { status: 500 }
    );
  }
}

// API endpoint to submit a new case for approval
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Unauthorized") },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Get the client's profile
    const clientProfile = await prisma.clientProfile.findUnique({
      where: {
        userId: payload.id
      },
      include: {
        user: true
      }
    });

    if (!clientProfile) {
      return NextResponse.json(
        { success: false, message: translateToAmharic("Client profile not found") },
        { status: 404 }
      );
    }

    // Create a new case with pending status
    const newCase = await prisma.case.create({
      data: {
        title: data.title,
        description: data.description,
        status: CaseStatus.PENDING,
        client: {
          connect: {
            id: payload.id
          }
        },
        clientName: clientProfile.user.fullName,
        clientPhone: clientProfile.phone,
        wereda: clientProfile.wereda,
        kebele: clientProfile.kebele,
        clientRequest: data.description,
        assignedOffice: {
          connect: {
            id: clientProfile.officeId
          }
        },
        priority: Priority.MEDIUM,
        category: (data.category as CaseCategory) || CaseCategory.OTHER
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newCase,
        phone: newCase.clientPhone
      }
    });
  } catch (error) {
    console.error("Error creating waiting case:", error);
    return NextResponse.json(
      { success: false, message: translateToAmharic("Failed to create case") },
      { status: 500 }
    );
  }
} 