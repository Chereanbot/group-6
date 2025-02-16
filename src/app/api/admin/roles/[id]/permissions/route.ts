import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { permissionId } = await request.json();

    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Toggle permission
    const hasPermission = role.permissions.some(p => p.id === permissionId);
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        permissions: {
          [hasPermission ? 'disconnect' : 'connect']: { id: permissionId }
        }
      },
      include: { permissions: true }
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update role permissions' },
      { status: 500 }
    );
  }
} 