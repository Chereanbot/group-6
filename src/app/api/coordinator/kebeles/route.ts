import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

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
      include: {
        manager: true
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

    // Create Kebele with manager
    const kebele = await prisma.kebele.create({
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
          create: {
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