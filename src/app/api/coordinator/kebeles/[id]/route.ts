import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const authResult = await verifyAuth(token);

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Ensure params.id exists
    if (!params?.id) {
      return NextResponse.json(
        { error: 'Kebele ID is required' },
        { status: 400 }
      );
    }

    const kebele = await prisma.kebele.findUnique({
      where: {
        id: params.id
      },
      include: {
        manager: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            position: true
          }
        }
      }
    });

    if (!kebele) {
      return NextResponse.json(
        { error: 'Kebele not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(kebele);
  } catch (error) {
    console.error('Error fetching kebele:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kebele' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const authResult = await verifyAuth(token);

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Ensure params.id exists
    if (!params?.id) {
      return NextResponse.json(
        { error: 'Kebele ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      kebeleNumber,
      kebeleName,
      population,
      subCity,
      district,
      mainOffice,
      contactPhone,
      contactEmail,
      workingHours,
      services,
      manager
    } = body;

    // Check if manager phone already exists (excluding current kebele's manager)
    const existingManager = await prisma.kebeleManager.findFirst({
      where: {
        AND: [
          { phone: manager.phone },
          { kebeleId: { not: params.id } }
        ]
      }
    });

    if (existingManager) {
      return NextResponse.json(
        { error: 'A manager with this phone number already exists' },
        { status: 400 }
      );
    }

    // Check if manager email already exists (excluding current kebele's manager)
    if (manager.email) {
      const existingManagerEmail = await prisma.kebeleManager.findFirst({
        where: {
          AND: [
            { email: manager.email },
            { kebeleId: { not: params.id } }
          ]
        }
      });

      if (existingManagerEmail) {
        return NextResponse.json(
          { error: 'A manager with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Update Kebele and its manager
    const updatedKebele = await prisma.kebele.update({
      where: {
        id: params.id
      },
      data: {
        kebeleNumber,
        kebeleName,
        population: parseInt(population),
        subCity,
        district,
        mainOffice,
        contactPhone,
        contactEmail,
        workingHours,
        services,
        manager: {
          update: {
            fullName: manager.fullName,
            phone: manager.phone,
            email: manager.email,
            position: manager.position,
            officeLocation: mainOffice
          }
        }
      },
      include: {
        manager: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            position: true
          }
        }
      }
    });

    return NextResponse.json(updatedKebele);
  } catch (error) {
    console.error('Error updating kebele:', error);
    return NextResponse.json(
      { error: 'Failed to update kebele' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const authResult = await verifyAuth(token);

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the manager first
    await prisma.kebeleManager.deleteMany({
      where: {
        kebeleId: params.id
      }
    });

    // Then delete the kebele
    await prisma.kebele.deleteMany({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Kebele and associated manager deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting kebele:', error);
    return NextResponse.json(
      { error: 'Failed to delete kebele' },
      { status: 500 }
    );
  }
} 