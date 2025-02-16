import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      include: {
        coordinator: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'PLANNED',
        coordinatorId: data.coordinatorId
      },
      include: {
        coordinator: {
          include: {
            user: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 