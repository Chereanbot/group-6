import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
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

    if (userRole !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized: Only clients can access this information' },
        { status: 403 }
      );
    }

    // Get the client's case first
    const case_ = await prisma.case.findFirst({
      where: {
        clientId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!case_) {
      return NextResponse.json(
        { error: 'No case found' },
        { status: 404 }
      );
    }

    // Get all activities for the case
    const activities = await prisma.caseActivity.findMany({
      where: {
        caseId: case_.id,
      },
      include: {
        case: {
          select: {
            assignedLawyer: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      activities: activities.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        status: activity.type === 'COURT_HEARING' ? 'PENDING' :
                activity.type === 'DOCUMENT_FILING' ? 'IN_PROGRESS' :
                activity.type === 'EVIDENCE_COLLECTION' ? 'COMPLETED' :
                'IN_PROGRESS', // Default status based on activity type
        createdAt: activity.createdAt,
        lawyer: {
          name: activity.case.assignedLawyer?.fullName || 'Unassigned',
        },
      })),
    });
  } catch (error) {
    console.error("[CLIENT_CASE_ACTIVITIES]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 