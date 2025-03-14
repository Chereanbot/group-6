import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { CaseStatus, NotificationType, Priority, Role, ReminderType, ReminderPriority, ReminderCategory } from "@prisma/client";

const activitySchema = z.object({
  caseId: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum([
    "COURT_HEARING",
    "DOCUMENT_FILING",
    "CLIENT_MEETING",
    "COURT_FILING",
    "EVIDENCE_COLLECTION",
    "WITNESS_INTERVIEW",
    "SETTLEMENT_DISCUSSION",
    "DOCUMENT_REVIEW",
    "LEGAL_RESEARCH",
    "CLIENT_COMMUNICATION",
    "OTHER"
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  courtDate: z.string().optional(),
  courtLocation: z.string().optional(),
  notifyClient: z.boolean(),
  notifyAdmin: z.boolean(),
  reminderBefore: z.enum(["1_HOUR", "3_HOURS", "1_DAY", "3_DAYS", "1_WEEK"]).optional(),
  additionalNotes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can create activities' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = activitySchema.parse(body);

    // Check if the case exists and belongs to the lawyer
    const case_ = await prisma.case.findFirst({
      where: {
        id: validatedData.caseId,
        lawyerId: userId,
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        }
      }
    });

    if (!case_) {
      return NextResponse.json(
        { error: 'Case not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create the activity
    const activity = await prisma.caseActivity.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        caseId: validatedData.caseId,
        userId: userId,
        createdAt: new Date(),
      },
    });

    // Create notifications if requested
    if (validatedData.notifyClient && case_.client) {
      await prisma.notification.create({
        data: {
          userId: case_.client.id,
          title: `New Activity: ${validatedData.title}`,
          message: `A new activity has been added to your case: ${case_.title}`,
          type: "STATUS_UPDATE",
          status: "UNREAD",
          metadata: {
            activityId: activity.id,
            caseId: case_.id,
            activityType: validatedData.type,
          },
        },
      });
    }

    if (validatedData.notifyAdmin) {
      // Get admin users
      const admins = await prisma.user.findMany({
        where: {
          userRole: "SUPER_ADMIN",
        },
      });

      // Create notifications for each admin
      await Promise.all(
        admins.map((admin) =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              title: `New Case Activity`,
              message: `Lawyer ${userId} added a new activity to case: ${case_.title}`,
              type: "STATUS_UPDATE",
              status: "UNREAD",
              metadata: {
                activityId: activity.id,
                caseId: case_.id,
                activityType: validatedData.type,
                lawyerId: userId,
              },
            },
          })
        )
      );
    }

    // Create reminder if requested
    if (validatedData.reminderBefore) {
      const reminderDate = calculateReminderDate(
        validatedData.courtDate ? new Date(validatedData.courtDate) : new Date(validatedData.dueDate!),
        validatedData.reminderBefore
      );

      await prisma.reminder.create({
        data: {
          serviceRequestId: validatedData.caseId,
          type: ReminderType.EMAIL,
          priority: ReminderPriority.NORMAL,
          category: ReminderCategory.GENERAL,
          scheduledFor: reminderDate,
          templateData: {
            title: `Reminder: ${validatedData.title}`,
            message: `Upcoming activity: ${validatedData.title} for case ${case_.title}`,
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Activity created successfully',
      activity,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error("[CASE_ACTIVITY_CREATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function calculateReminderDate(targetDate: Date, reminderBefore: string): Date {
  const date = new Date(targetDate);
  switch (reminderBefore) {
    case "1_HOUR":
      date.setHours(date.getHours() - 1);
      break;
    case "3_HOURS":
      date.setHours(date.getHours() - 3);
      break;
    case "1_DAY":
      date.setDate(date.getDate() - 1);
      break;
    case "3_DAYS":
      date.setDate(date.getDate() - 3);
      break;
    case "1_WEEK":
      date.setDate(date.getDate() - 7);
      break;
  }
  return date;
}

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can view activities' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where = {
      userId,
      ...(caseId && { caseId }),
      ...(type && type !== 'ALL' && { type }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    // First get the activities
    const [activities, total] = await Promise.all([
      prisma.caseActivity.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          createdAt: true,
          caseId: true,
          userId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.caseActivity.count({ where }),
    ]);

    // Then get the case details
    const caseIds = activities.map(activity => activity.caseId);
    const cases = await prisma.case.findMany({
      where: {
        id: {
          in: caseIds,
        },
      },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
      },
    });

    // Combine the data
    const enrichedActivities = activities.map(activity => ({
      ...activity,
      case: cases.find(c => c.id === activity.caseId),
    }));

    return NextResponse.json({
      activities: enrichedActivities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[CASE_ACTIVITY_LIST]", error);
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
        { error: 'Unauthorized: Only lawyers can update case activities' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('id');

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = activitySchema.partial().parse(body);

    // Check if the activity exists and belongs to the lawyer
    const activity = await prisma.caseActivity.findFirst({
      where: {
        id: activityId,
        userId: userId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the activity
    const updatedActivity = await prisma.caseActivity.update({
      where: { id: activityId },
      data: validatedData,
      include: {
        case: {
          select: {
            title: true,
            category: true,
            status: true,
          },
        },
        assignedUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error("[CASE_ACTIVITY_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
        { error: 'Unauthorized: Only lawyers can delete case activities' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('id');

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    // Check if the activity exists and belongs to the lawyer
    const activity = await prisma.caseActivity.findFirst({
      where: {
        id: activityId,
        userId: userId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the activity
    await prisma.caseActivity.delete({
      where: { id: activityId },
    });

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error("[CASE_ACTIVITY_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 