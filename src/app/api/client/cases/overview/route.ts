import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { CaseStatus } from "@prisma/client";

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

    // Get the client's case
    const case_ = await prisma.case.findFirst({
      where: {
        clientId: userId,
      },
      include: {
        assignedLawyer: {
          include: {
            ratings: true,
          },
        },
        caseEvents: true,
        timeEntries: true,
        documents: true,
        activities: {
          select: {
            id: true,
            type: true,
            createdAt: true,
            title: true,
          },
        },
      },
    });

    if (!case_) {
      return NextResponse.json(
        { error: 'No case found' },
        { status: 404 }
      );
    }

    // Calculate lawyer's rating
    const lawyerRating = case_.assignedLawyer?.ratings.length
      ? case_.assignedLawyer.ratings.reduce((sum, r) => sum + r.rating, 0) / case_.assignedLawyer.ratings.length
      : 0;

    // Calculate case progress based on completed events
    const totalEvents = case_.caseEvents.length;
    const completedEvents = case_.caseEvents.filter(e => e.status === 'COMPLETED').length;
    const progress = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

    // Calculate days active
    const daysActive = Math.ceil(
      (new Date().getTime() - new Date(case_.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      caseDetails: {
        title: case_.title,
        status: case_.status,
        category: case_.category,
        priority: case_.priority,
        createdAt: case_.createdAt,
        progress: Math.round(progress),
        lawyer: {
          name: case_.assignedLawyer?.fullName || 'Unassigned',
          rating: lawyerRating,
        },
      },
      metrics: {
        totalActivities: case_.activities.length,
        completedActivities: completedEvents,
        documentsSubmitted: case_.documents.length,
        daysActive,
      },
    });
  } catch (error) {
    console.error("[CLIENT_CASE_OVERVIEW]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 