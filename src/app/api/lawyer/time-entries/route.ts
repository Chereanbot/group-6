import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.timeEntry.findMany({
      where: {
        lawyerId: session.user.id
      },
      include: {
        case: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Transform the data to match the TimeEntry interface
    const transformedEntries = entries.map(entry => ({
      id: entry.id,
      caseId: entry.caseId || '',
      caseName: entry.case?.title || 'No Case',
      description: entry.description,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration,
      billable: entry.billable,
      rate: entry.rate,
      status: entry.status
    }));

    return NextResponse.json(transformedEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const entry = await prisma.timeEntry.create({
      data: {
        ...data,
        lawyerId: session.user.id,
        startTime: new Date(),
        status: 'RUNNING'
      },
      include: {
        case: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Transform the response to match the TimeEntry interface
    const transformedEntry = {
      id: entry.id,
      caseId: entry.caseId || '',
      caseName: entry.case?.title || 'No Case',
      description: entry.description,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration,
      billable: entry.billable,
      rate: entry.rate,
      status: entry.status
    };

    return NextResponse.json(transformedEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
} 