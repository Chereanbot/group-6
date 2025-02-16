import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, CaseStatus, Priority, CaseCategory } from '@prisma/client';

export async function POST(req: Request) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Find the user with the token and verify super admin role
    const user = await prisma.user.findFirst({
      where: {
        userRole: UserRoleEnum.SUPER_ADMIN
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Super Admin access required' },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const data = await req.json();
    console.log('Received data:', data);

    if (!data.clientName || !data.clientPhone || !data.category || !data.clientRequest) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        title: data.title || data.description?.substring(0, 100) || 'New Case',
        description: data.description || '',
        category: data.category as CaseCategory,
        priority: (data.priority as Priority) || Priority.MEDIUM,
        status: CaseStatus.PENDING,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress || '',
        region: data.region || '',
        zone: data.zone || '',
        wereda: data.wereda || '',
        kebele: data.kebele || '',
        houseNumber: data.houseNumber || '',
        clientRequest: data.clientRequest,
        requestDetails: data.requestDetails || {},
        client: {
          connect: {
            id: user.id
          }
        },
        tags: data.tags || [],
        complexityScore: data.complexityScore || 0,
        riskLevel: data.riskLevel || 0,
        resourceIntensity: data.resourceIntensity || 0,
        stakeholderImpact: data.stakeholderImpact || 0,
        documentCount: 0,
        totalBillableHours: 0
      }
    });

    // Create initial case activity
    await prisma.caseActivity.create({
      data: {
        title: 'Case Created',
        description: 'New case was created',
        type: 'CREATED',
        caseId: newCase.id,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        case: newCase
      }
    });

  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create case'
      },
      { status: 500 }
    );
  }
} 