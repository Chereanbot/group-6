import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum, DefaultRolePermissions } from '@/types/security.types';

// Default role templates
const DEFAULT_ROLE_TEMPLATES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: DefaultRolePermissions.SUPER_ADMIN,
    isSystemRole: true
  },
  ADMIN: {
    name: 'Admin',
    description: 'Administrative access with limited system permissions',
    permissions: DefaultRolePermissions.ADMIN,
    isSystemRole: true
  },
  LAWYER: {
    name: 'Lawyer',
    description: 'Legal professional with case management permissions',
    permissions: DefaultRolePermissions.LAWYER,
    isSystemRole: true
  },
  COORDINATOR: {
    name: 'Coordinator',
    description: 'Case coordinator with client management permissions',
    permissions: DefaultRolePermissions.COORDINATOR,
    isSystemRole: true
  },
  CLIENT: {
    name: 'Client',
    description: 'Client with limited access to their own cases',
    permissions: DefaultRolePermissions.CLIENT,
    isSystemRole: true
  },
  PARALEGAL: {
    name: 'Paralegal',
    description: 'Legal assistant with document management permissions',
    permissions: DefaultRolePermissions.PARALEGAL,
    isSystemRole: true
  },
  ACCOUNTANT: {
    name: 'Accountant',
    description: 'Financial manager with billing permissions',
    permissions: DefaultRolePermissions.ACCOUNTANT,
    isSystemRole: true
  }
};

// Initialize default roles
async function initializeDefaultRoles() {
  try {
    for (const [roleKey, roleTemplate] of Object.entries(DEFAULT_ROLE_TEMPLATES)) {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleTemplate.name }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: {
            name: roleTemplate.name,
            description: roleTemplate.description,
            isSystemRole: roleTemplate.isSystemRole,
            permissions: {
              create: roleTemplate.permissions.map(permissionName => ({
                permission: {
                  connect: { name: permissionName }
                }
              }))
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error initializing default roles:', error);
  }
}

// Get all roles with their permissions
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const session = await prisma.session.findFirst({
      where: {
        token,
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

    if (!session?.user || !session.user.isAdmin || 
        ![UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(session.user.userRole as UserRoleEnum)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

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
            userRole: true,
            status: true,
            lastLogin: true
          }
        }
      },
      orderBy: {
        isSystemRole: 'desc'
      }
    });

    return NextResponse.json({ success: true, roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// Create new role
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const session = await prisma.session.findFirst({
      where: {
        token,
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

    if (!session?.user || !session.user.isAdmin || 
        ![UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(session.user.userRole as UserRoleEnum)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { name, description, permissions, isSystemRole = false } = await request.json();

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid role name' },
        { status: 400 }
      );
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 400 }
      );
    }

    // Validate permissions
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: 'At least one permission is required' },
        { status: 400 }
      );
    }

    // Create role with permissions
    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        isSystemRole,
        permissions: {
          create: permissions.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId }
            }
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
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

// Update role
export async function PUT(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const session = await prisma.session.findFirst({
      where: {
        token,
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

    if (!session?.user || !session.user.isAdmin || 
        ![UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(session.user.userRole as UserRoleEnum)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id, name, description, permissions } = await request.json();

    // Validate input
    if (!id || !name) {
      return NextResponse.json(
        { error: 'Invalid role data' },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true }
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent modification of system roles
    if (existingRole.isSystemRole) {
      return NextResponse.json(
        { error: 'Cannot modify system roles' },
        { status: 403 }
      );
    }

    // Check if new name conflicts with existing role
    if (name !== existingRole.name) {
      const nameConflict = await prisma.role.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          },
          NOT: { id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Role name already exists' },
          { status: 400 }
        );
      }
    }

    // Validate permissions
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: 'At least one permission is required' },
        { status: 400 }
      );
    }

    // Update role and its permissions
    const updatedRole = await prisma.$transaction(async (tx) => {
      // Update basic info
      const role = await tx.role.update({
      where: { id },
      data: {
        name,
        description
      }
    });

      // Update permissions
      await tx.rolePermission.deleteMany({
        where: { roleId: id }
      });

      await tx.rolePermission.createMany({
        data: permissions.map((permissionId: string) => ({
          roleId: id,
          permissionId
        }))
      });

      return role;
    });

    return NextResponse.json({ success: true, role: updatedRole });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// Delete role
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const session = await prisma.session.findFirst({
      where: {
        token,
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

    if (!session?.user || !session.user.isAdmin || 
        ![UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN].includes(session.user.userRole as UserRoleEnum)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Invalid role ID' },
        { status: 400 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of system roles
    if (role.isSystemRole) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      );
    }

    // Check if role has assigned users
    if (role.users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users' },
        { status: 400 }
      );
    }

    // Delete role and its permissions
    await prisma.$transaction(async (tx) => {
      // Delete role permissions
      await tx.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Delete role
      await tx.role.delete({
      where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
} 