import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scheduleBackup, updateBackupSchedule } from '@/lib/backup';

// GET /api/admin/backup/schedule - Get backup schedule
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedules = await prisma.backupSchedule.findMany({
      include: {
        settings: {
          include: {
            backup: true
          }
        }
      }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching backup schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup schedules' },
      { status: 500 }
    );
  }
}

// POST /api/admin/backup/schedule - Create or update backup schedule
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { settingsId, enabled, frequency, timeOfDay } = body;

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeOfDay)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:mm' },
        { status: 400 }
      );
    }

    // Create or update schedule
    const schedule = await prisma.backupSchedule.upsert({
      where: {
        settingsId
      },
      update: {
        enabled,
        frequency,
        timeOfDay,
        updatedAt: new Date()
      },
      create: {
        settingsId,
        enabled,
        frequency,
        timeOfDay
      }
    });

    // Update next run time
    await updateBackupSchedule(schedule.id);

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating backup schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update backup schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/backup/schedule - Delete backup schedule
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    await prisma.backupSchedule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting backup schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup schedule' },
      { status: 500 }
    );
  }
} 