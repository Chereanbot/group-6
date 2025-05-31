import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, CaseStatus, Priority, CaseCategory, Gender, HealthStatus, CaseType } from '@prisma/client';

type CaseResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  cases?: any[];
};

export async function POST(request: Request): Promise<NextResponse<CaseResponse>> {
  try {
    // Get auth token from headers or cookies
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 200 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    // Get coordinator profile with office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: user.id },
      include: { office: true }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found or no office assigned' },
        { status: 404 }
      );
    }

    // Handle form data
    const formData = await request.formData();
    
    // Extract case data from form
    const body = {
      title: formData.get('title')?.toString() || '',
      description: formData.get('description')?.toString() || '',
      category: formData.get('category')?.toString() || '',
      priority: formData.get('priority')?.toString() || 'MEDIUM',
      region: formData.get('region')?.toString() || '',
      zone: formData.get('zone')?.toString() || '',
      wereda: formData.get('wereda')?.toString() || '',
      kebele: formData.get('kebele')?.toString() || '',
      houseNumber: formData.get('houseNumber')?.toString() || '',
      caseType: formData.get('caseType')?.toString() || '',
      caseDescription: formData.get('caseDescription')?.toString() || '',
      evidenceDescription: formData.get('evidenceDescription')?.toString() || '',
      clientName: formData.get('clientName')?.toString() || '',
      clientPhone: formData.get('clientPhone')?.toString() || '',
      clientEmail: formData.get('clientEmail')?.toString() || '',
      age: parseInt(formData.get('age')?.toString() || '0'),
      sex: formData.get('sex')?.toString() || Gender.OTHER,
      numberOfFamily: parseInt(formData.get('numberOfFamily')?.toString() || '0'),
      healthStatus: formData.get('healthStatus')?.toString() || HealthStatus.OTHER
    };

    // Handle file uploads if any
    const files = formData.getAll('documents').filter(item => item instanceof File) as File[];
    console.log('Received documents:', files.length);

    // Validate required fields
    const requiredFields = {
      title: body.title,
      category: body.category,
      wereda: body.wereda,
      kebele: body.kebele,
      clientName: body.clientName,
      clientPhone: body.clientPhone
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(CaseCategory).includes(body.category as CaseCategory)) {
      return NextResponse.json(
        { success: false, message: 'Invalid case category' },
        { status: 400 }
      );
    }

    // Create or find client first if email is provided
    let clientId: string | undefined;
    
    if (body.clientEmail) {
      const client = await prisma.user.upsert({
        where: { email: body.clientEmail },
        update: {
          phone: body.clientPhone,
          fullName: body.clientName,
        },
        create: {
          email: body.clientEmail,
          phone: body.clientPhone,
          fullName: body.clientName,
          password: await generateTempPassword(),
          userRole: UserRoleEnum.CLIENT,
          clientProfile: {
            create: {
              age: body.age,
              sex: (body.sex as Gender) || Gender.OTHER,
              phone: body.clientPhone,
              numberOfFamily: body.numberOfFamily,
              healthStatus: (body.healthStatus as HealthStatus) || HealthStatus.OTHER,
              region: body.region || '',
              zone: body.zone || '',
              wereda: body.wereda || '',
              kebele: body.kebele || '',
              caseType: (body.caseType?.toUpperCase() as CaseType) || CaseType.OTHER,
              caseCategory: body.category as CaseCategory,
              assignedOffice: {
                connect: {
                  id: coordinator.officeId
                }
              }
            }
          }
        }
      });
      
      clientId = client.id;
    }

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category as CaseCategory,
        priority: (body.priority || 'MEDIUM') as Priority,
        status: CaseStatus.PENDING,
        region: body.region,
        zone: body.zone,
        wereda: body.wereda,
        kebele: body.kebele,
        houseNumber: body.houseNumber,
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        clientRequest: body.caseDescription,
        documentNotes: body.evidenceDescription,
        assignedOffice: {
          connect: { id: coordinator.officeId }
        },
        ...(clientId && {
          client: {
            connect: { id: clientId }
          }
        })
      }
    });

    // Create case activity
    await prisma.caseActivity.create({
      data: {
        caseId: newCase.id,
        userId: user.id,
        title: 'Case Created',
        description: `Case created by coordinator ${user.fullName}`,
        type: 'CREATED'
      }
    });

    // Create coordinator history
    await prisma.coordinatorHistory.create({
      data: {
        coordinatorId: coordinator.id,
        action: 'CASE_ASSIGNED',
        caseId: newCase.id,
        changedBy: user.id,
        context: {
          title: newCase.title,
          category: newCase.category,
          clientName: newCase.clientName
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });

  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create case'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request): Promise<NextResponse<CaseResponse>> {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    // Build where clause
    const where: any = {
      officeId: coordinator.officeId
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    try {
      // Fetch cases for the coordinator's office
      const cases = await prisma.case.findMany({
        where,
        select: {
          id: true,
          title: true,
          clientName: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
          clientId: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          assignedLawyer: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          assignedOffice: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          _count: {
            select: {
              activities: true,
              documents: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          cases: cases
        }
      });
    } catch (dbError) {
      console.error('Database error fetching cases:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database error while fetching cases',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in GET /api/coordinator/cases:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch cases',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to generate temporary password
async function generateTempPassword(): Promise<string> {
  return Math.random().toString(36).slice(-8);
} 