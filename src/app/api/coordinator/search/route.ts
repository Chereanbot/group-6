import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'You must be logged in.' }),
        { status: 403 }
      );
    }

    if (!query) {
      return new NextResponse(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400 }
      );
    }

    // Search across multiple models
    const [cases, clients, appointments] = await Promise.all([
      // Search cases
      prisma.case.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { caseNumber: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),

      // Search clients
      prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
          userRole: 'CLIENT',
        },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      }),

      // Search appointments
      prisma.appointment.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      cases,
      clients,
      appointments,
    });
  } catch (error) {
    console.error('Search error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to perform search' }),
      { status: 500 }
    );
  }
} 