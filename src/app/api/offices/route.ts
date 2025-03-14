import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { OfficeType, OfficeStatus, UserStatus, Prisma, UserRoleEnum } from '@prisma/client';
import { cookies } from 'next/headers';
import {
  FormattedOffice,
  OfficeStats,
  OfficeResponse,
  CreateOfficeRequest,
  UpdateOfficeRequest,
  ErrorResponse,
  CASE_STATUS
} from '@/types/office';

// GET - List all offices with filtering and pagination
export async function GET(request: Request): Promise<NextResponse<OfficeResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Get offices with relations and active status
    const offices = await prisma.office.findMany({
      where: {
        ...(type ? { type: type as OfficeType } : {}),
        ...(status ? { status: status as OfficeStatus } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      },
      include: {
        coordinators: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                status: true
              }
            }
          }
        },
        lawyers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get case counts for each lawyer
    const lawyerCaseCounts = await Promise.all(
      offices.flatMap(office => 
        office.lawyers.map(async lawyer => {
          const caseCount = await prisma.case.count({
            where: {
              lawyerId: lawyer.user.id,
              status: {
                in: [CASE_STATUS.ACTIVE, CASE_STATUS.PENDING, CASE_STATUS.RESOLVED]
              }
            }
          });
          return {
            lawyerId: lawyer.user.id,
            caseCount
          };
        })
      )
    );

    // Create a map of lawyer IDs to case counts
    const casesMap = new Map(
      lawyerCaseCounts.map(item => [item.lawyerId, item.caseCount])
    );

    // Transform the data to include all metrics
    const formattedOffices: FormattedOffice[] = offices.map(office => {
      const activeLawyers = office.lawyers.filter(l => l.user.status === UserStatus.ACTIVE);
      const activeCoordinators = office.coordinators.filter(c => c.user.status === UserStatus.ACTIVE);

      return {
        id: office.id,
        name: office.name,
        location: office.location || '',
        type: office.type,
        status: office.status,
        capacity: office.capacity || 10,
        contactEmail: office.contactEmail,
        contactPhone: office.contactPhone,
        address: office.address,
        metrics: {
          lawyers: {
            total: office.lawyers.length,
            active: activeLawyers.length
          },
          coordinators: {
            total: office.coordinators.length,
            active: activeCoordinators.length,
            capacity: office.capacity || 10,
            available: (office.capacity || 10) - activeCoordinators.length
          },
          clients: 0, // Will be updated with actual client count
          cases: {
            total: 0,
            active: 0,
            resolved: 0,
            pending: 0
          }
        },
        coordinators: activeCoordinators.map(c => ({
          id: c.user.id,
          fullName: c.user.fullName,
          email: c.user.email,
          status: c.user.status
        })),
        lawyers: activeLawyers.map(l => ({
          id: l.user.id,
          fullName: l.user.fullName,
          email: l.user.email,
          status: l.user.status,
          caseCount: casesMap.get(l.user.id) || 0
        }))
      };
    });

    // Update case and client metrics
    await Promise.all(
      formattedOffices.map(async office => {
        const lawyerIds = office.lawyers.map(l => l.id);
        
        const cases = await prisma.case.findMany({
          where: {
            lawyerId: {
              in: lawyerIds
            }
          },
          select: {
            id: true,
            status: true,
            clientId: true
          }
        });

        const uniqueClients = new Set(cases.map(c => c.clientId));
        
        office.metrics.clients = uniqueClients.size;
        office.metrics.cases = {
          total: cases.length,
          active: cases.filter(c => c.status === CASE_STATUS.ACTIVE).length,
          resolved: cases.filter(c => c.status === CASE_STATUS.RESOLVED).length,
          pending: cases.filter(c => c.status === CASE_STATUS.PENDING).length
        };
      })
    );

    // Calculate overall statistics
    const stats: OfficeStats = {
      totalOffices: offices.length,
      activeOffices: offices.filter(o => o.status === OfficeStatus.ACTIVE).length,
      totalStaff: formattedOffices.reduce((sum, o) => 
        sum + o.metrics.lawyers.active + o.metrics.coordinators.active, 0
      ),
      totalCases: formattedOffices.reduce((sum, o) => sum + o.metrics.cases.total, 0),
      totalClients: formattedOffices.reduce((sum, o) => sum + o.metrics.clients, 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        offices: formattedOffices,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch offices',
        data: null
      },
      { status: 500 }
    );
  }
}

// POST - Create a new office
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access', data: null },
        { status: 401 }
      );
    }

    // Only admins can create offices
    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions', data: null },
        { status: 403 }
      );
    }

    const body = await request.json() as CreateOfficeRequest;
    const {
      name,
      location,
      type,
      status = OfficeStatus.ACTIVE,
      contactEmail,
      contactPhone,
      address,
      capacity
    } = body;

    // Validate required fields
    if (!name || !location || !type || !contactEmail || !contactPhone) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          data: null
        },
        { status: 400 }
      );
    }

    // Check if office with same name exists
    const existingOffice = await prisma.office.findUnique({
      where: { name }
    });

    if (existingOffice) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Office with this name already exists',
          data: null
        },
        { status: 400 }
      );
    }

    // Create new office
    const office = await prisma.office.create({
      data: {
        name,
        location,
        type,
        status,
        contactEmail,
        contactPhone,
        address,
        capacity
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: authResult.user.id,
        action: 'CREATE_OFFICE',
        details: {
          officeId: office.id,
          officeName: office.name
        } as Prisma.JsonObject
      }
    });

    return NextResponse.json({
      success: true,
      data: office
    });

  } catch (error) {
    console.error('Error creating office:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create office',
        data: null,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing office
export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');
    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access', data: null },
        { status: 401 }
      );
    }

    // Only admins can update offices
    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions', data: null },
        { status: 403 }
      );
    }

    const body = await request.json() as UpdateOfficeRequest;
    const {
      id,
      name,
      location,
      type,
      status,
      contactEmail,
      contactPhone,
      address,
      capacity
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Office ID is required', data: null },
        { status: 400 }
      );
    }

    // Check if office exists
    const existingOffice = await prisma.office.findUnique({
      where: { id }
    });

    if (!existingOffice) {
      return NextResponse.json(
        { error: 'Office not found', data: null },
        { status: 404 }
      );
    }

    // If name is being changed, check for duplicates
    if (name && name !== existingOffice.name) {
      const duplicateOffice = await prisma.office.findUnique({
        where: { name }
      });

      if (duplicateOffice) {
        return NextResponse.json(
          { error: 'Office with this name already exists', data: null },
          { status: 400 }
        );
      }
    }

    // Update office
    const updatedOffice = await prisma.office.update({
      where: { id },
      data: {
        name,
        location,
        type,
        status,
        contactEmail,
        contactPhone,
        address,
        capacity
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: authResult.user.id,
        action: 'UPDATE_OFFICE',
        details: {
          officeId: updatedOffice.id,
          officeName: updatedOffice.name,
          changes: {
            name,
            location,
            type,
            status,
            contactEmail,
            contactPhone,
            address,
            capacity
          }
        } as Prisma.JsonObject
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedOffice
    });

  } catch (error) {
    console.error('Error updating office:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update office',
        data: null,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET_CLIENT() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.CLIENT) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get client's profile to check their region
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { region: true }
    });

    // Fetch offices based on client's region
    const offices = await prisma.office.findMany({
      where: {
        status: 'ACTIVE',
        // If client has a region, filter by it
        ...(clientProfile?.region && {
          OR: [
            { region: clientProfile.region },
            { isMainBranch: true } // Include main branches regardless of region
          ]
        })
      },
      include: {
        coordinators: {
          where: {
            status: 'ACTIVE',
            user: {
              status: 'ACTIVE'
            }
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    // Transform the data to include coordinator information
    const transformedOffices = offices.map(office => ({
      id: office.id,
      name: office.name,
      location: office.location,
      region: office.region,
      description: office.description,
      isMainBranch: office.isMainBranch,
      coordinators: office.coordinators.map(coord => ({
        id: coord.id,
        fullName: coord.user.fullName,
        email: coord.user.email,
        phone: coord.user.phone,
        type: coord.type,
        specialties: coord.specialties,
        status: coord.status
      }))
    }));

    return NextResponse.json({
      success: true,
      data: transformedOffices
    });

  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch offices" },
      { status: 500 }
    );
  }
} 