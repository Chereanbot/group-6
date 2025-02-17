import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CaseStatus, CaseType, Priority, CaseCategory, UserRoleEnum, Prisma, ActivityType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'clientName',
      'clientPhone',
      'caseType',
      'caseDescription',
      'coordinatorId',
      'officeId'
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create or update case in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if user exists by phone number
      let user = await tx.user.findFirst({
        where: { phone: data.clientPhone }
      });

      // Create user if doesn't exist
      if (!user) {
        user = await tx.user.create({
          data: {
            fullName: data.clientName,
            phone: data.clientPhone,
            email: data.clientEmail || null,
            password: Math.random().toString(36).slice(-8), // Generate random password
            userRole: UserRoleEnum.CLIENT,
            status: 'ACTIVE'
          }
        });
      }

      // Create the case
      const newCase = await tx.case.create({
        data: {
          title: data.caseDescription,
          description: data.caseDescription,
          status: CaseStatus.ACTIVE,
          priority: data.priority || Priority.MEDIUM,
          category: data.category as CaseCategory || CaseCategory.OTHER,
          
          // Client Information
          clientName: data.clientName,
          clientPhone: data.clientPhone,
          clientAddress: data.clientAddress || '',
          
          // Location Details
          region: data.region || '',
          zone: data.zone || '',
          wereda: data.wereda,
          kebele: data.kebele,
          houseNumber: data.houseNumber || '',
          
          // Request & Response
          clientRequest: data.clientRequest,
          requestDetails: data.requestDetails || {},
          
          // Relations
          client: {
            connect: {
              id: user.id
            }
          },
          assignedOffice: {
            connect: {
              id: data.officeId
            }
          },

          // Create initial activity
          activities: {
            create: {
              title: "Case Created",
              type: "CREATED",
              description: `Case created for client ${data.clientName}`,
              userId: user.id
            }
          }
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userRole: true
            }
          },
          assignedOffice: true,
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
          }
        }
      });

      return newCase;
    });

    return NextResponse.json({
      success: true,
      data: result
    });

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