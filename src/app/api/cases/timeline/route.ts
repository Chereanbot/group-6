import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activities = await prisma.caseActivity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        case: {
          select: {
            title: true,
            status: true,
            priority: true
          }
        },
        user: {
          select: {
            fullName: true,
            role: true
          }
        }
      }
    });

    const timelineEvents = activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      date: activity.createdAt.toISOString(),
      type: activity.type,
      caseId: activity.caseId,
      caseName: activity.case.title,
      caseStatus: activity.case.status,
      casePriority: activity.case.priority,
      actor: activity.user.fullName,
      actorRole: activity.user.role
    }));

    return NextResponse.json(timelineEvents);
  } catch (error) {
    console.error('Error fetching case timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
} 