import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const endTime = new Date(data.endTime);

    const entry = await prisma.timeEntry.findFirst({
      where: {
        lawyerId: session.user.id,
        status: 'RUNNING'
      }
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'No active time entry found' },
        { status: 404 }
      );
    }

    const duration = Math.floor((endTime.getTime() - entry.startTime.getTime()) / 1000);

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: entry.id },
      data: {
        endTime,
        duration,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error stopping time entry:', error);
    return NextResponse.json(
      { error: 'Failed to stop time entry' },
      { status: 500 }
    );
  }
} 