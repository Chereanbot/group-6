import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
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

    const kebeles = await prisma.kebele.findMany({
      select: {
        id: true,
        kebeleNumber: true,
        kebeleName: true,
        population: true,
        subCity: true,
        district: true,
        contactPhone: true,
        contactEmail: true,
        workingHours: true,
        services: true,
        status: true,
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

    return NextResponse.json(kebeles || []);
  } catch (error) {
    console.error('Error fetching kebeles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kebeles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Check if manager phone already exists
    const existingManager = await prisma.kebeleManager.findUnique({
      where: {
        phone: manager.phone
      }
    });

    if (existingManager) {
      return NextResponse.json(
        { error: 'A manager with this phone number already exists' },
        { status: 400 }
      );
    }

    // Check if manager email already exists
    const existingManagerEmail = await prisma.kebeleManager.findUnique({
      where: {
        email: manager.email
      }
    });

    if (existingManagerEmail) {
      return NextResponse.json(
        { error: 'A manager with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a random password for the manager
    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create Kebele with manager
    const kebele = await prisma.kebele.create({
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
        services: services || [],
        manager: {
          create: {
            fullName: manager.fullName,
            phone: manager.phone,
            email: manager.email,
            position: manager.position,
            officeLocation: mainOffice,
            password: hashedPassword
          }
        }
      },
      select: {
        id: true,
        kebeleNumber: true,
        kebeleName: true,
        population: true,
        subCity: true,
        district: true,
        mainOffice: true,
        contactPhone: true,
        contactEmail: true,
        workingHours: true,
        services: true,
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

    return NextResponse.json({
      kebele,
      managerPassword: generatedPassword
    });
  } catch (error) {
    console.error('Error creating kebele:', error);
    return NextResponse.json(
      { error: 'Failed to create kebele' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
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

    const kebele = await prisma.kebele.update({
      where: { id },
      data: {
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
        manager: true
      }
    });

    return NextResponse.json(kebele);
  } catch (error) {
    console.error('Error updating kebele:', error);
    return NextResponse.json(
      { error: 'Failed to update kebele' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Kebele ID is required' },
        { status: 400 }
      );
    }

    // Delete the manager first (due to the relation)
    await prisma.kebeleManager.delete({
      where: { kebeleId: id }
    });

    // Then delete the kebele
    await prisma.kebele.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kebele:', error);
    return NextResponse.json(
      { error: 'Failed to delete kebele' },
      { status: 500 }
    );
  }
} 