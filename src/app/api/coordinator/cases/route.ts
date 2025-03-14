import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, CaseStatus, Priority, CaseCategory } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify authentication and coordinator role
    const authResult = await verifyAuth(token);
    
    if (!authResult.isAuthenticated || authResult.user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid role' },
        { status: 401 }
      );
    }

    // Get coordinator profile with office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: authResult.user.id },
      include: { office: true }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json(
        { success: false, error: 'Coordinator not found or no office assigned' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      region,
      zone,
      wereda,
      kebele,
      houseNumber,
      caseType,
      caseDescription,
      evidenceDescription,
      clientName,
      clientPhone,
      clientEmail,
      documents
    } = body;

    // Validate required fields
    if (!title || !category || !wereda || !kebele || !clientName || !clientPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        category: category as CaseCategory,
        priority: (priority || 'MEDIUM') as Priority,
        status: CaseStatus.PENDING,
        region,
        zone,
        wereda,
        kebele,
        houseNumber,
        clientName,
        clientPhone,
        clientRequest: caseDescription,
        documentNotes: evidenceDescription,
        assignedOffice: {
          connect: { id: coordinator.officeId }
        },
        // Create client if email is provided
        client: clientEmail ? {
          connectOrCreate: {
            where: { email: clientEmail },
            create: {
              email: clientEmail,
              phone: clientPhone,
              fullName: clientName,
              password: '', // This should be handled properly in production
              userRole: UserRoleEnum.CLIENT
            }
          }
        } : undefined
      }
    });

    // Create case activity
    await prisma.caseActivity.create({
      data: {
        caseId: newCase.id,
        userId: authResult.user.id,
        title: 'Case Created',
        description: `Case created by coordinator ${authResult.user.fullName}`,
        type: 'CREATED'
      }
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });

  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create case' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please login first" },
        { status: 401 }
      );
    }

    // Verify authentication and check coordinator role
    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is a coordinator
    if (user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Only coordinators can view cases" },
        { status: 403 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: user.id },
      select: { officeId: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: "Coordinator profile not found" },
        { status: 404 }
      );
    }

    // Fetch cases for the coordinator's office
    const cases = await prisma.case.findMany({
      where: {
        officeId: coordinator.officeId
      },
      select: {
        id: true,
        title: true,
        clientName: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        assignedLawyer: {
          select: {
            fullName: true
          }
        },
        assignedOffice: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      cases: cases
    });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cases" },
      { status: 500 }
    );
  }
} 