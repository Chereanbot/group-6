import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { AppealStatus } from "@prisma/client";

const appealUpdateSchema = z.object({
  status: z.enum(['SCHEDULED', 'HEARD', 'DECIDED', 'WITHDRAWN']).optional(),
  decision: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId || userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only super admins can access appeals' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AppealStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [appeals, total] = await Promise.all([
      prisma.appeal.findMany({
        where,
        include: {
          case: {
            include: {
              assignedLawyer: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                }
              }
            }
          },
          documents: true,
          hearings: {
            orderBy: {
              scheduledDate: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.appeal.count({ where })
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
          lawyer: appeal.case.assignedLawyer ? {
            name: appeal.case.assignedLawyer.fullName,
            email: appeal.case.assignedLawyer.email,
          } : null
        },
        documentCount: appeal.documents.length,
        documents: appeal.documents,
        nextHearing: appeal.hearings[0] || null,
        createdAt: appeal.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("[ADMIN_APPEALS_LIST]", error);
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

    if (!userId || userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only super admins can update appeals' },
        { status: 401 }
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
    const validatedData = appealUpdateSchema.parse(body);

    const appeal = await prisma.appeal.findUnique({
      where: { id: appealId },
      include: {
        case: {
          include: {
            assignedLawyer: {
              select: {
                email: true,
              }
            }
          }
        }
      }
    });

    if (!appeal) {
      return NextResponse.json(
        { error: 'Appeal not found' },
        { status: 404 }
      );
    }

    // Prepare update data based on what's being updated
    const updateData: any = {};
    
    if (validatedData.status) {
      updateData.status = validatedData.status;
      updateData.decidedAt = validatedData.status === 'DECIDED' ? new Date() : null;
    }
    
    if (validatedData.decision) {
      updateData.decision = validatedData.decision;
    }
    
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    const updatedAppeal = await prisma.appeal.update({
      where: { id: appealId },
      data: updateData,
      include: {
        case: {
          include: {
            assignedLawyer: {
              select: {
                fullName: true,
                email: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Appeal updated successfully',
      appeal: updatedAppeal
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error("[ADMIN_APPEAL_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 