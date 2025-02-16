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

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { lawyerId: session.user.id },
          { participants: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        case: {
          select: {
            id: true,
            title: true
          }
        },
        documents: {
          select: {
            id: true,
            name: true,
            url: true
          }
        },
        participants: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();

    if (!data.title || !data.start || !data.end) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        userId: session.user.id
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { message: 'Failed to create event' },
      { status: 500 }
    );
  }
} 