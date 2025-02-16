import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get the token from the authorization header
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify the token and check if user is admin
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || authResult.user?.role !== 'ADMIN') {
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    if (data.type === 'ASSIGN_PERMISSION') {
      const { roleId, permissionId } = data;
      
      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId
        }
      });
    } else if (data.type === 'REMOVE_PERMISSION') {
      const { roleId, permissionId } = data;
      
      await prisma.rolePermission.delete({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        }
      });
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