import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded.isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: true,
        users: {
          select: {
            id: true
          }
        }
      }
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
      usersCount: role.users.length,
      createdAt: role.createdAt
    }));

    return NextResponse.json(formattedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded.isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { name, description, permissions } = await request.json();

    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissions.map((id: string) => ({ id }))
        }
      },
      include: {
        permissions: true,
        users: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
      usersCount: role.users.length,
      createdAt: role.createdAt
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 