import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { CaseStatus, Priority, CaseCategory } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Only admins and coordinators can create cases
    if (!authResult.user.isAdmin && authResult.user.userRole !== 'COORDINATOR') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      status = CaseStatus.ACTIVE,
      priority = Priority.MEDIUM,
      category,
      clientName,
      clientPhone,
      clientAddress,
      region,
      zone,
      wereda,
      kebele,
      houseNumber,
      clientRequest,
      requestDetails,
      documentNotes,
      tags = [],
      complexityScore = 0,
      riskLevel = 0,
      resourceIntensity = 0,
      stakeholderImpact = 0,
      expectedResolutionDate,
      lawyerId,
      officeId
    } = body;

    // Validate required fields
    if (!title || !category || !clientName || !clientPhone || !wereda || !kebele || !clientRequest) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    // Create new case
    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        status,
        priority,
        category,
        clientName,
        clientPhone,
        clientAddress,
        region,
        zone,
        wereda,
        kebele,
        houseNumber,
        clientRequest,
        requestDetails,
        documentNotes,
        tags,
        complexityScore,
        riskLevel,
        resourceIntensity,
        stakeholderImpact,
        expectedResolutionDate: expectedResolutionDate ? new Date(expectedResolutionDate) : undefined,
        lawyerId,
        officeId,
        clientId: authResult.user.id // Set the creator as the client
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: authResult.user.id,
        action: 'CREATE_CASE',
        details: {
          caseId: newCase.id,
          caseTitle: newCase.title
        }
      }
    });

    // Create initial case activity
    await prisma.caseActivity.create({
      data: {
        caseId: newCase.id,
        userId: authResult.user.id,
        action: 'CASE_CREATED',
        details: {
          title: newCase.title,
          category: newCase.category
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newCase
    });

  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create case',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET - List all cases with filtering and pagination
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') as CaseCategory | null;
    const status = searchParams.get('status') as CaseStatus | null;
    const priority = searchParams.get('priority') as Priority | null;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
        { clientPhone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    // If not admin, only show cases assigned to the user or created by them
    if (!authResult.user.isAdmin) {
      where.OR = [
        { lawyerId: authResult.user.id },
        { clientId: authResult.user.id }
      ];
    }

    // Get total count
    const total = await prisma.case.count({ where });

    // Get cases with relations
    const cases = await prisma.case.findMany({
      where,
      include: {
        assignedLawyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        office: true,
        activities: {
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            documents: true,
            notes: true,
            appeals: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        cases,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPreviousPage
        }
      }
    });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cases',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 