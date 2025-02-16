import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      password,
      position,
      officeLocation,
      kebeleId
    } = body;

    // Validate kebele exists
    const kebele = await prisma.kebele.findUnique({
      where: { id: kebeleId },
      include: { manager: true }
    });

    if (!kebele) {
      return NextResponse.json(
        { error: 'Kebele not found' },
        { status: 404 }
      );
    }

    if (kebele.manager) {
      return NextResponse.json(
        { error: 'Kebele already has a manager assigned' },
        { status: 400 }
      );
    }

    // Check if phone or email already exists
    const existingManager = await prisma.kebeleManager.findFirst({
      where: {
        OR: [
          { phone },
          { email: email || undefined }
        ]
      }
    });

    if (existingManager) {
      return NextResponse.json(
        { error: 'Phone number or email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create kebele manager
    const manager = await prisma.kebeleManager.create({
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword,
        position,
        officeLocation,
        kebeleId,
        status: 'ACTIVE'
      }
    });

    // Return manager data without password
    const { password: _, ...managerData } = manager;
    return NextResponse.json(managerData);
  } catch (error) {
    console.error('Error creating kebele manager:', error);
    return NextResponse.json(
      { error: 'Failed to create kebele manager' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kebeleId = searchParams.get('kebeleId');

    const where = kebeleId ? { kebeleId } : {};

    const managers = await prisma.kebeleManager.findMany({
      where,
      include: {
        kebele: {
          select: {
            kebeleName: true,
            kebeleNumber: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remove passwords from response
    const sanitizedManagers = managers.map(manager => {
      const { password, ...managerData } = manager;
      return managerData;
    });

    return NextResponse.json(sanitizedManagers);
  } catch (error) {
    console.error('Error fetching kebele managers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kebele managers' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      fullName,
      phone,
      email,
      password,
      position,
      officeLocation,
      status
    } = body;

    // Check if manager exists
    const existingManager = await prisma.kebeleManager.findUnique({
      where: { id }
    });

    if (!existingManager) {
      return NextResponse.json(
        { error: 'Kebele manager not found' },
        { status: 404 }
      );
    }

    // Check if phone or email is already in use by another manager
    const duplicateCheck = await prisma.kebeleManager.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { phone },
              { email: email || undefined }
            ]
          }
        ]
      }
    });

    if (duplicateCheck) {
      return NextResponse.json(
        { error: 'Phone number or email already in use' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      fullName,
      phone,
      email,
      position,
      officeLocation,
      status
    };

    // Only hash and update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update manager
    const manager = await prisma.kebeleManager.update({
      where: { id },
      data: updateData
    });

    // Return manager data without password
    const { password: _, ...managerData } = manager;
    return NextResponse.json(managerData);
  } catch (error) {
    console.error('Error updating kebele manager:', error);
    return NextResponse.json(
      { error: 'Failed to update kebele manager' },
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
        { error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    // Delete manager
    await prisma.kebeleManager.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kebele manager:', error);
    return NextResponse.json(
      { error: 'Failed to delete kebele manager' },
      { status: 500 }
    );
  }
} 