import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users except the current user
    const contacts = await prisma.user.findMany({
      where: {
        NOT: {
          id: session.user.id
        },
        // Only get active users
        status: 'ACTIVE',
        // Optionally filter by role if needed
        // userRole: {
        //   in: ['LAWYER', 'CLIENT', 'COORDINATOR']
        // }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        userRole: true,
        lawyerProfile: {
          select: {
            specializations: {
              select: {
                specialization: true
              }
            }
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
} 