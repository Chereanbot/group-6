import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import { Prisma, CaseType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: { office: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rawCaseType = searchParams.get('caseType');
    const caseType = rawCaseType && rawCaseType !== 'ALL' ? rawCaseType as CaseType : undefined;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {
      userRole: 'CLIENT',
      clientProfile: {
        is: {
          officeId: coordinator.officeId,
          ...(caseType ? { caseType } : {})
        }
      },
      OR: search ? [
        { 
          fullName: { 
            contains: search, 
            mode: 'insensitive' 
          } 
        },
        { 
          email: { 
            contains: search, 
            mode: 'insensitive' 
          } 
        },
        { 
          phone: { 
            contains: search, 
            mode: 'insensitive' 
          } 
        }
      ] : undefined
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get clients
    const clients = await prisma.user.findMany({
      where,
      include: {
        clientProfile: {
          select: {
            age: true,
            sex: true,
            region: true,
            zone: true,
            wereda: true,
            kebele: true,
            caseType: true,
            caseCategory: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Transform data for response
    const transformedClients = clients.map(client => ({
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      profile: client.clientProfile
    }));

    return NextResponse.json({
      success: true,
      clients: transformedClients,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
} 