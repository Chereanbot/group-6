import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CaseStatus, CaseType, Priority, CaseCategory, UserRoleEnum, Prisma, ActivityType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const clientPhone = formData.get('clientPhone') as string;
    const clientName = formData.get('clientName') as string;

    // First check if a user with this phone number exists
    let clientUser = await prisma.user.findUnique({
      where: {
        phone: clientPhone
      }
    });

    // Client relation configuration
    const clientRelation = clientUser ? {
      connect: {
        id: clientUser.id
      }
    } : {
      create: {
        email: `${clientPhone.replace(/[^0-9]/g, '')}@dulas.temp`,
        phone: clientPhone,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        fullName: clientName,
        userRole: UserRoleEnum.CLIENT,
        status: 'ACTIVE'
      }
    };

    // Extract basic case information
    const caseData: Prisma.CaseCreateInput = {
      title: formData.get('caseDescription') as string,
      description: formData.get('caseDescription') as string,
      status: CaseStatus.ACTIVE,
      priority: (formData.get('priority') as Priority) || Priority.MEDIUM,
      category: (formData.get('caseCategory') as CaseCategory) || CaseCategory.OTHER,

      // Client Information
      clientName: clientName,
      clientPhone: clientPhone,
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

      // Set client relation
      client: clientRelation
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

      // Create initial activity
      await tx.caseActivity.create({
        data: {
          caseId: case_.id,
          userId: case_.client.id,
          title: "Case Created",
          type: "CREATED",
          description: `Case created for client ${case_.clientName}`
        }
      });

      return case_;
    });

    return NextResponse.json({ success: true, data: newCase });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as CaseStatus;
    const priority = searchParams.get('priority') as Priority;
    const search = searchParams.get('search');
    const type = searchParams.get('type') as CaseType;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.CaseWhereInput = {
      // Add filters only if they are provided
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
      }),
      // Filter by office
      officeId: {
        not: null
      }
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
          assignedOffice: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
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
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 