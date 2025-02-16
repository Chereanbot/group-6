import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CaseStatus, CaseType, Priority, CaseCategory, UserRoleEnum, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define session user type
interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRoleEnum;
  status: string;
  isAdmin: boolean;
  officeId?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const formData = await request.formData();
    
    // Get coordinator info with proper type
    const coordinator = session?.user as SessionUser | undefined;
    
    // Extract basic case information
    const caseData: Prisma.CaseCreateInput = {
      title: formData.get('caseDescription') as string,
      description: formData.get('caseDescription') as string,
      status: CaseStatus.ACTIVE,
      priority: (formData.get('priority') as Priority) || Priority.MEDIUM,
      category: (formData.get('caseCategory') as CaseCategory) || CaseCategory.OTHER,

      // Client Information
      clientName: formData.get('clientName') as string,
      clientPhone: formData.get('clientPhone') as string,
      clientAddress: formData.get('clientAddress') as string || '',

      // Location Details
      region: formData.get('region') as string || '',
      zone: formData.get('zone') as string || '',
      wereda: formData.get('wereda') as string,
      kebele: formData.get('kebele') as string,
      houseNumber: formData.get('houseNumber') as string || '',

      // Request & Response
      clientRequest: formData.get('clientRequest') as string,
      requestDetails: JSON.parse(formData.get('requestDetails') as string || '{}'),
      
      // Tags
      tags: JSON.parse(formData.get('tags') as string || '[]'),

      // Expected resolution
      expectedResolutionDate: formData.get('expectedResolutionDate') 
        ? new Date(formData.get('expectedResolutionDate') as string)
        : null,

      // Set client relation if coordinator exists
      ...(coordinator && {
        client: {
          connect: {
            id: coordinator.id
          }
        }
      }),

      // Set office relation if available
      ...(coordinator?.officeId && {
        assignedOffice: {
          connect: {
            id: coordinator.officeId
          }
        }
      })
    };

    // Validate required fields
    const requiredFields = {
      clientName: caseData.clientName,
      clientPhone: caseData.clientPhone,
      wereda: caseData.wereda,
      kebele: caseData.kebele,
      clientRequest: caseData.clientRequest
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields', 
          fields: missingFields 
        },
        { status: 400 }
      );
    }

    // Create case in transaction
    const newCase = await prisma.$transaction(async (tx) => {
      // Create the case
      const case_ = await tx.case.create({
        data: caseData,
        include: {
          documents: true,
          activities: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  userRole: true
                }
              }
            }
          },
          assignedOffice: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userRole: true
            }
          }
        }
      });

      // Handle document uploads if any
      const documents = formData.getAll('documents');
      if (documents.length > 0) {
        for (const doc of documents) {
          if (doc instanceof File) {
            await tx.caseDocument.create({
              data: {
                caseId: case_.id,
                title: doc.name,
                path: '/temp/path',
                size: doc.size,
                mimeType: doc.type,
                uploadedBy: coordinator?.id || 'system',
                type: 'CASE_DOCUMENT'
              }
            });
          }
        }
      }

      // Create initial case activity
      await tx.caseActivity.create({
        data: {
          caseId: case_.id,
          userId: coordinator?.id || 'system',
          title: 'Case Created',
          description: `Case created by ${coordinator?.name || 'anonymous'} from ${case_.assignedOffice?.name || 'unknown'} office`,
          type: 'CREATION'
        }
      });

      return case_;
    });

    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });

  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create case',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);
    const coordinator = session?.user as SessionUser;
    
    // Ensure coordinator has an office assigned
    if (!coordinator?.officeId) {
      return NextResponse.json({
        success: false,
        error: 'Coordinator must be assigned to an office to view cases'
      }, { status: 400 });
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as CaseStatus;
    const priority = searchParams.get('priority') as Priority;
    const search = searchParams.get('search');
    const type = searchParams.get('type') as CaseType;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.CaseWhereInput = {
      // Filter by coordinator's office using proper relation
      assignedOffice: coordinator?.officeId ? {
        id: coordinator.officeId
      } : undefined,
      
      ...(status && { status }),
      ...(priority && { priority }),
      ...(type && { caseType: type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { clientName: { contains: search, mode: 'insensitive' } },
          { clientPhone: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [total, cases] = await prisma.$transaction([
      prisma.case.count({ where }),
      prisma.case.findMany({
        where,
        include: {
          documents: true,
          activities: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  userRole: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          assignedOffice: true,
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userRole: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cases,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch cases',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 