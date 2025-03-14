import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { calculateCaseProgress } from '@/lib/case-progress';
import { NotificationStatus, NotificationType, Prisma, TimeEntry } from '@prisma/client';
import { ServiceType } from '@/types/time-entry';

interface TimeEntryData {
  caseId: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number;
  serviceType: ServiceType;
  needsFollowUp: boolean;
  followUpNotes?: string;
}

export async function POST(request: Request) {
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');

  if (!userId || userRole !== 'LAWYER') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data: TimeEntryData = await request.json();

    // Create time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        lawyerId: userId,
        caseId: data.caseId,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        duration: data.duration,
        serviceType: data.serviceType,
        needsFollowUp: data.needsFollowUp,
        followUpNotes: data.followUpNotes || null,
        status: data.endTime ? 'COMPLETED' : 'IN_PROGRESS'
      } as Prisma.TimeEntryUncheckedCreateInput
    });

    // If time entry is completed, recalculate case progress
    if (timeEntry.status === 'COMPLETED' && timeEntry.caseId) {
      const progress = await calculateCaseProgress(timeEntry.caseId);
      
      // Create case activity for the completed service
      await prisma.caseActivity.create({
        data: {
          title: `${data.serviceType} Completed`,
          description: `Legal aid service completed: ${data.description}`,
          type: 'SERVICE_DELIVERY',
          caseId: timeEntry.caseId,
          userId
        } as Prisma.CaseActivityUncheckedCreateInput
      });

      // If all required services are completed, notify admin
      if (progress?.remainingServices.length === 0) {
        await prisma.notification.create({
          data: {
            title: 'Case Ready for Review',
            message: `All required services completed for case #${timeEntry.caseId}`,
            type: NotificationType.SYSTEM_UPDATE,
            status: NotificationStatus.UNREAD,
            priority: 'HIGH',
            userId: timeEntry.lawyerId,
            caseId: timeEntry.caseId
          } as Prisma.NotificationUncheckedCreateInput
        });
      }
    }

    // If follow-up is needed, create a notification
    if (data.needsFollowUp) {
      await prisma.notification.create({
        data: {
          title: 'Follow-up Required',
          message: `Follow-up needed for case: ${data.followUpNotes}`,
          type: NotificationType.SERVICE_REQUEST,
          status: NotificationStatus.UNREAD,
          priority: 'HIGH',
          userId,
          caseId: data.caseId
        } as Prisma.NotificationUncheckedCreateInput
      });
    }

    return NextResponse.json({
      timeEntry,
      message: 'Time entry created successfully'
    });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
} 