import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserStatus, UserRoleEnum } from '@prisma/client';
import { Gender, HealthStatus } from '@/types/client';
import { CaseType, CaseCategory } from '@/types/case';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';

// GET - Fetch clients with pagination and filters
export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
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

    // Get coordinator's office ID
    const coordinator = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        coordinatorProfile: true
      }
    });

    if (!coordinator || !coordinator.coordinatorProfile) {
      return NextResponse.json(
        { success: false, message: 'Coordinator profile not found' },
        { status: 404 }
      );
    }

    // Fetch clients from the coordinator's office
    const clients = await prisma.user.findMany({
      where: {
        userRole: UserRoleEnum.CLIENT,
        clientProfile: {
          officeId: coordinator.coordinatorProfile.officeId
        }
      },
      include: {
        clientProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: clients
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Register new client
export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
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

    const data = await request.json();
    const { 
      fullName, 
      age, 
      sex, 
      numberOfFamily, 
      healthStatus, 
      phones, 
      region, 
      zone, 
      wereda, 
      kebele, 
      houseNumber, 
      caseType, 
      caseCategory, 
      officeId,
      guidelines,
      notes 
    } = data;

    // Validate required fields
    if (!fullName || !phones || phones.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Name and at least one phone number are required' },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        phone: { in: phones }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Generate temporary email and password
    const tempEmail = `${fullName.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@temp.com`;
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create new client with profile
    const result = await prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          fullName,
          email: tempEmail,
          phone: phones[0],
          password: tempPassword,
          userRole: UserRoleEnum.CLIENT,
          status: UserStatus.ACTIVE
        }
      });

      // Create client profile
      const clientProfile = await tx.clientProfile.create({
        data: {
          userId: user.id,
          age: Number(age),
          sex: sex as Gender,
          phone: phones[0],
          numberOfFamily: Number(numberOfFamily),
          healthStatus: healthStatus as HealthStatus,
          region,
          zone,
          wereda,
          kebele,
          houseNumber,
          caseType: caseType as CaseType,
          caseCategory: caseCategory as CaseCategory,
          officeId,
          guidelines,
          notes
        }
      });

      return {
        ...user,
        clientProfile
      };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PATCH - Update client status or information
export async function PATCH(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
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

    const data = await request.json();
    const { id, status, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Update client information
    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        ...(status && { status: status as UserStatus }),
        ...(updateData.fullName && { fullName: updateData.fullName }),
        ...(updateData.phone && { phone: updateData.phone })
      }
    });

    // Update client profile if needed
    if (updateData.clientProfile) {
      await prisma.clientProfile.update({
        where: { userId: id },
        data: {
          ...(updateData.clientProfile.age && { age: Number(updateData.clientProfile.age) }),
          ...(updateData.clientProfile.sex && { sex: updateData.clientProfile.sex as Gender }),
          ...(updateData.clientProfile.phone && { phone: updateData.clientProfile.phone }),
          ...(updateData.clientProfile.numberOfFamily && { numberOfFamily: Number(updateData.clientProfile.numberOfFamily) }),
          ...(updateData.clientProfile.healthStatus && { healthStatus: updateData.clientProfile.healthStatus as HealthStatus }),
          ...(updateData.clientProfile.region && { region: updateData.clientProfile.region }),
          ...(updateData.clientProfile.zone && { zone: updateData.clientProfile.zone }),
          ...(updateData.clientProfile.wereda && { wereda: updateData.clientProfile.wereda }),
          ...(updateData.clientProfile.kebele && { kebele: updateData.clientProfile.kebele }),
          ...(updateData.clientProfile.houseNumber && { houseNumber: updateData.clientProfile.houseNumber }),
          ...(updateData.clientProfile.caseType && { caseType: updateData.clientProfile.caseType as CaseType }),
          ...(updateData.clientProfile.caseCategory && { caseCategory: updateData.clientProfile.caseCategory as CaseCategory }),
          ...(updateData.clientProfile.guidelines && { guidelines: updateData.clientProfile.guidelines }),
          ...(updateData.clientProfile.notes && { notes: updateData.clientProfile.notes })
        }
      });
    }

    // Get updated client with profile
    const client = await prisma.user.findUnique({
      where: { id },
      include: {
        clientProfile: true
      }
    });

    return NextResponse.json({
      success: true,
      data: client
    });

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a client
export async function DELETE(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 request.headers.get('cookie')?.split('; ')
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

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id');

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Delete client profile first (due to foreign key constraint)
    await prisma.clientProfile.delete({
      where: { userId: clientId }
    });

    // Then delete the user
    await prisma.user.delete({
      where: { id: clientId }
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete client' },
      { status: 500 }
    );
  }
}

// GET /api/coordinator/clients
export async function GET_coordinator() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch clients associated with the current coordinator
    const clients = await prisma.client.findMany({
      where: {
        coordinator: {
          email: session.user.email
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        caseType: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/coordinator/clients
export async function POST_coordinator(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    
    // Create new client
    const client = await prisma.client.create({
      data: {
        ...data,
        coordinator: {
          connect: {
            email: session.user.email
          }
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        caseType: true,
        status: true,
      }
    });

    return NextResponse.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PUT /api/coordinator/clients
export async function PUT_coordinator(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();

    // Update client
    const client = await prisma.client.update({
      where: {
        id,
        coordinator: {
          email: session.user.email
        }
      },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        caseType: true,
        status: true,
      }
    });

    return NextResponse.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/coordinator/clients
export async function DELETE_coordinator(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Delete client
    await prisma.client.delete({
      where: {
        id,
        coordinator: {
          email: session.user.email
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 