import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/edge-auth';
import prisma from '@/lib/prisma';
import { ServiceType, ServiceCategory, UserRoleEnum } from '@prisma/client';

interface AuthResponse {
  isAuthenticated: boolean;
  payload?: {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
    coordinatorId?: string;
    officeId?: string;
  };
}

// GET - Fetch all service packages
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, payload } = await verifyAuth(token) as AuthResponse;
    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const packages = await prisma.servicePackage.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        requests: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    console.error('Error fetching service packages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service packages' },
      { status: 500 }
    );
  }
}

// POST - Create a new service package
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, payload } = await verifyAuth(token) as AuthResponse;
    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      serviceType,
      category,
      price,
      features,
      eligibilityCriteria,
      estimatedDuration
    } = body;

    // Validate required fields
    if (!name || !description || !serviceType || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate service type
    if (!Object.values(ServiceType).includes(serviceType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Validate category
    if (!Object.values(ServiceCategory).includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid service category' },
        { status: 400 }
      );
    }

    const newPackage = await prisma.servicePackage.create({
      data: {
        name: name.toLowerCase(),
        description,
        serviceType,
        category,
        price: parseFloat(price),
        features: features || [],
        eligibilityCriteria: eligibilityCriteria || [],
        estimatedDuration: estimatedDuration || '1-2 weeks',
        authorId: payload.id,
        createdById: payload.id,
        active: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Service package created successfully',
      data: newPackage
    });
  } catch (error) {
    console.error('Error creating service package:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service package' },
      { status: 500 }
    );
  }
}

// PUT - Update a service package
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, payload } = await verifyAuth(token) as AuthResponse;
    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      serviceType,
      category,
      price,
      features,
      eligibilityCriteria,
      estimatedDuration,
      active
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Package ID is required' },
        { status: 400 }
      );
    }

    const updatedPackage = await prisma.servicePackage.update({
      where: { id },
      data: {
        name: name?.toLowerCase(),
        description,
        serviceType,
        category,
        price: price ? parseFloat(price) : undefined,
        features,
        eligibilityCriteria,
        estimatedDuration,
        active
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Service package updated successfully',
      data: updatedPackage
    });
  } catch (error) {
    console.error('Error updating service package:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service package' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service package
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { isAuthenticated, payload } = await verifyAuth(token) as AuthResponse;
    if (!isAuthenticated || !payload || payload.role !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Package ID is required' },
        { status: 400 }
      );
    }

    await prisma.servicePackage.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Service package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service package:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete service package' },
      { status: 500 }
    );
  }
} 