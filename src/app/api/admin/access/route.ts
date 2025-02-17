import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@/types/security.types';

async function validateAdminAccess(token: string | null) {
  if (!token) {
    return false;
  }

  try {
    // Find user by token
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        active: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userRole: true,
            isAdmin: true
          }
        }
      }
    });

    if (!session?.user) {
      return false;
    }

    return session.user.isAdmin && 
      [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(session.user.userRole as UserRoleEnum);
  } catch (error) {
    console.error('Error validating admin access:', error);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1] || null;
    const isAuthorized = await validateAdminAccess(token);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Fetch roles with their permissions
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        users: {
          select: {
            id: true,
            email: true,
            fullName: true,
            userRole: true
          }
        }
      }
    });

    // Fetch all permissions
    const permissions = await prisma.permission.findMany();

    // Group permissions by module
    const permissionsByModule = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);

    return NextResponse.json({
      roles,
      permissions: permissionsByModule
    });
  } catch (error) {
    console.error('Error fetching access control data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1] || null;
    const isAuthorized = await validateAdminAccess(token);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    if (data.type === 'ASSIGN_PERMISSION') {
      const { roleId, permissionId } = data;
      
      // Validate inputs
      if (!roleId || !permissionId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check if role and permission exist
      const [role, permission] = await Promise.all([
        prisma.role.findUnique({ where: { id: roleId } }),
        prisma.permission.findUnique({ where: { id: permissionId } })
      ]);

      if (!role || !permission) {
        return NextResponse.json(
          { error: 'Role or permission not found' },
          { status: 404 }
        );
      }

      // Check if permission is already assigned
      const existingAssignment = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        }
      });

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'Permission already assigned to role' },
          { status: 400 }
        );
      }

      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId
        }
      });
    } else if (data.type === 'REMOVE_PERMISSION') {
      const { roleId, permissionId } = data;
      
      // Validate inputs
      if (!roleId || !permissionId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check if assignment exists
      const existingAssignment = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        }
      });

      if (!existingAssignment) {
        return NextResponse.json(
          { error: 'Permission not assigned to role' },
          { status: 404 }
        );
      }

      await prisma.rolePermission.delete({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid operation type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating access control:', error);
    return NextResponse.json(
      { error: 'Failed to update access control' },
      { status: 500 }
    );
  }
} 