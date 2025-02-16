import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify admin access
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { type, roleId, permissionId, permission } = data;

    switch (type) {
      case 'CREATE':
        const newPermission = await prisma.permission.create({
          data: {
            name: permission.name,
            description: permission.description,
            module: permission.module
          }
        });
        return NextResponse.json({ success: true, permission: newPermission });

      case 'ASSIGN':
        // Check if the role and permission exist
        const [role, perm] = await Promise.all([
          prisma.role.findUnique({ where: { id: roleId } }),
          prisma.permission.findUnique({ where: { id: permissionId } })
        ]);

        if (!role || !perm) {
          return NextResponse.json(
            { error: 'Role or Permission not found' },
            { status: 404 }
          );
        }

        // Check if the assignment already exists
        const existingAssignment = await prisma.rolePermission.findFirst({
          where: {
            roleId,
            permissionId
          }
        });

        if (existingAssignment) {
          return NextResponse.json(
            { error: 'Permission already assigned to this role' },
            { status: 400 }
          );
        }

        // Create the assignment
        await prisma.rolePermission.create({
          data: {
            roleId,
            permissionId
          }
        });

        return NextResponse.json({ 
          success: true,
          message: 'Permission assigned successfully'
        });

      case 'REMOVE':
        // Check if the assignment exists before trying to delete
        const assignment = await prisma.rolePermission.findFirst({
          where: {
            roleId,
            permissionId
          }
        });

        if (!assignment) {
          return NextResponse.json(
            { error: 'Permission assignment not found' },
            { status: 404 }
          );
        }

        await prisma.rolePermission.delete({
          where: {
            id: assignment.id
          }
        });

        return NextResponse.json({ 
          success: true,
          message: 'Permission removed successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid operation type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Permission operation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process permission operation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { permission } = data;

    const updatedPermission = await prisma.permission.update({
      where: { id: permission.id },
      data: {
        name: permission.name,
        description: permission.description,
        module: permission.module
      }
    });

    return NextResponse.json({ 
      success: true, 
      permission: updatedPermission 
    });
  } catch (error) {
    console.error('Permission update error:', error);
    return NextResponse.json(
      { error: 'Failed to update permission' },
      { status: 500 }
    );
  }
} 