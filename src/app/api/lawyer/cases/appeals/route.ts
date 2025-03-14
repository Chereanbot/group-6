import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AppealStatus } from "@prisma/client";

const appealSchema = z.object({
  caseId: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.nativeEnum(AppealStatus).optional(),
  hearingDate: z.string().optional(),
  documents: z.array(z.object({
    title: z.string().min(1, "Document title is required"),
    path: z.string().min(1, "Document path is required"),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can file appeals' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = appealSchema.parse(body);

    // Check if the lawyer already has a pending appeal
    const existingPendingAppeal = await prisma.appeal.findFirst({
      where: {
        filedBy: userId,
        status: 'PENDING',
      },
    });

    if (existingPendingAppeal) {
      return NextResponse.json(
        { 
          error: 'You already have a pending appeal request. Please wait for the law school to review your existing appeal before submitting a new one.',
          pendingAppealId: existingPendingAppeal.id 
        },
        { status: 400 }
      );
    }

    // Check if the case exists and belongs to the lawyer
    const case_ = await prisma.case.findFirst({
      where: {
        id: validatedData.caseId,
        lawyerId: userId,
      },
    });

    if (!case_) {
      return NextResponse.json(
        { error: 'Case not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create the appeal with all required fields
    const appeal = await prisma.appeal.create({
      data: {
        caseId: validatedData.caseId,
        title: validatedData.title,
        description: validatedData.description,
        status: 'PENDING', // Force status to be PENDING for new appeals
        filedBy: userId,
        filedDate: new Date(),
        hearingDate: validatedData.hearingDate ? new Date(validatedData.hearingDate) : null,
        documents: validatedData.documents ? {
          create: validatedData.documents.map(doc => ({
            title: doc.title,
            path: doc.path,
            uploadedAt: new Date(),
          }))
        } : undefined,
      },
      include: {
        case: {
          select: {
            title: true,
            status: true,
          }
        },
        documents: true,
        hearings: {
          orderBy: {
            scheduledDate: 'desc'
          },
          take: 1
        }
      }
    });

    // Create an initial hearing if hearing date is provided
    if (validatedData.hearingDate) {
      await prisma.appealHearing.create({
        data: {
          appealId: appeal.id,
          scheduledDate: new Date(validatedData.hearingDate),
          status: 'SCHEDULED',
          location: 'To be determined',
          notes: 'Initial hearing scheduled',
        }
      });
    }

    return NextResponse.json({
      message: 'Appeal request submitted successfully! Please wait for the law school to review and approve your appeal.',
      appeal: {
        id: appeal.id,
        title: appeal.title,
        description: appeal.description,
        status: appeal.status,
        filedDate: appeal.filedDate,
        hearingDate: appeal.hearingDate,
        case: {
          title: appeal.case.title,
          status: appeal.case.status,
        },
        documentCount: appeal.documents.length,
        nextHearing: appeal.hearings[0] || null,
        createdAt: appeal.createdAt,
      },
      redirectToList: true
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error("[APPEAL_CREATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can view appeals' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const status = searchParams.get('status') as AppealStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build the where clause with proper typing
    const where: {
      filedBy: string;
      caseId?: string;
      status?: AppealStatus;
    } = {
      filedBy: userId,
      ...(caseId && { caseId }),
      ...(status && { status }),
    };

    // Get appeals with related data
    const [appeals, total] = await Promise.all([
      prisma.appeal.findMany({
        where,
        include: {
          case: {
            select: {
              title: true,
              status: true,
            },
          },
          documents: true,
          hearings: {
            orderBy: {
              scheduledDate: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.appeal.count({ where }),
    ]);

    return NextResponse.json({
      appeals: appeals.map(appeal => ({
        id: appeal.id,
        title: appeal.title,
        description: appeal.description,
        status: appeal.status,
        filedDate: appeal.filedDate,
        hearingDate: appeal.hearingDate,
        decidedAt: appeal.decidedAt,
        decision: appeal.decision,
        case: {
          title: appeal.case.title,
          status: appeal.case.status,
        },
        documentCount: appeal.documents.length,
        nextHearing: appeal.hearings[0] || null,
        createdAt: appeal.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[APPEALS_LIST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can update appeals' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appealId = searchParams.get('id');

    if (!appealId) {
      return NextResponse.json(
        { error: 'Appeal ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = appealSchema.partial().parse(body);

    // Check if the appeal exists and belongs to the lawyer
    const appeal = await prisma.appeal.findFirst({
      where: {
        id: appealId,
        filedBy: userId,
      },
    });

    if (!appeal) {
      return NextResponse.json(
        { error: 'Appeal not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the appeal with proper typing
    const updateData = {
      title: validatedData.title,
      description: validatedData.description,
      hearingDate: validatedData.hearingDate ? new Date(validatedData.hearingDate) : undefined,
    };

    const updatedAppeal = await prisma.appeal.update({
      where: { id: appealId },
      data: updateData,
      include: {
        case: {
          select: {
            title: true,
            status: true,
          },
        },
        documents: true,
        hearings: {
          orderBy: {
            scheduledDate: 'desc',
          },
          take: 1,
        },
      },
    });

    return NextResponse.json(updatedAppeal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error("[APPEAL_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appealId = searchParams.get('id');
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!appealId) {
      return NextResponse.json(
        { error: 'Appeal ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can delete appeals' },
        { status: 403 }
      );
    }

    // Check if the appeal exists and belongs to the lawyer
    const appeal = await prisma.appeal.findFirst({
      where: {
        id: appealId,
        case: {
          lawyerId: userId,
        },
      },
    });

    if (!appeal) {
      return NextResponse.json(
        { error: 'Appeal not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete related records first
    await prisma.$transaction([
      // Delete appeal hearings
      prisma.appealHearing.deleteMany({
        where: { appealId },
      }),
      // Delete appeal documents
      prisma.appealDocument.deleteMany({
        where: { appealId },
      }),
      // Finally delete the appeal
      prisma.appeal.delete({
        where: { id: appealId },
      }),
    ]);

    return NextResponse.json({
      message: 'Appeal deleted successfully'
    });
  } catch (error) {
    console.error("[APPEAL_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete appeal" },
      { status: 500 }
    );
  }
} 