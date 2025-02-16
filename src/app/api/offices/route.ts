import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { OfficeType, OfficeStatus, OfficeName } from '@prisma/client';
import { cookies } from 'next/headers';

// GET - List all offices with filtering and pagination
export async function GET(request: Request) {
  try {
    // Get offices with relations and active status
    const offices = await prisma.office.findMany({
      where: {
        status: OfficeStatus.ACTIVE,
        name: {
          in: Object.values(OfficeName)
        }
      },
      select: {
        id: true,
        name: true,
        location: true,
        type: true,
        status: true,
        capacity: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        coordinators: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include availability info
    const formattedOffices = offices.map(office => ({
      id: office.id,
      name: office.name,
      location: office.location || '',
      type: office.type,
      status: office.status,
      capacity: office.capacity || 10, // Default capacity if not set
      currentCount: office.coordinators.length,
      contactEmail: office.contactEmail,
      contactPhone: office.contactPhone,
      address: office.address,
      available: (office.capacity || 10) > office.coordinators.length
    }));

    return NextResponse.json({
      success: true,
      data: {
        offices: formattedOffices
      }
    });

  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch offices'
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
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Only admins can create offices
    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
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
          error: 'Missing required fields'
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
          error: 'Office with this name already exists'
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
      },
      include: {
        lawyers: true,
        coordinators: true
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
        }
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
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Only admins can update offices
    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
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
        { error: 'Office ID is required' },
        { status: 400 }
      );
    }

    // Check if office exists
    const existingOffice = await prisma.office.findUnique({
      where: { id }
    });

    if (!existingOffice) {
      return NextResponse.json(
        { error: 'Office not found' },
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
          { error: 'Office with this name already exists' },
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
      },
      include: {
        lawyers: true,
        coordinators: true
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
          changes: body
        }
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
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 