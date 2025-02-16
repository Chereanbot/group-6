import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// Create new role
export async function POST(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { name, description, permissions } = await request.json();

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions?.map((permissionId: string) => ({
            permissionId
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    console.error('Role creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

// Update role
export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id, name, description, permissions } = await request.json();

    // First update the role basic info
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description
      }
    });

    // If permissions are provided, update them
    if (permissions) {
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Add new permissions
      await prisma.rolePermission.createMany({
        data: permissions.map((permissionId: string) => ({
          roleId: id,
          permissionId
        }))
      });
    }

    return NextResponse.json({ success: true, role: updatedRole });
  } catch (error) {
    console.error('Role update error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// Delete role
export async function DELETE(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    // First remove all permissions associations
    await prisma.rolePermission.deleteMany({
      where: { roleId: id }
    });

    // Then delete the role
    await prisma.role.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Role deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
} 