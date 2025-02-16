import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { username, phone, kebeleId } = await request.json();

    // Find the kebele manager by kebele ID and credentials
    const manager = await prisma.kebeleManager.findFirst({
      where: {
        kebeleId,
        AND: [
          {
            OR: [
              { phone },
              { email: username }
            ]
          }
        ]
      },
      include: {
        kebele: true
      }
    });

    if (!manager) {
      return NextResponse.json(
        { error: 'Invalid credentials or kebele ID' },
        { status: 403 }
      );
    }

    // Return manager data with kebele info
    return NextResponse.json({
      id: manager.id,
      fullName: manager.fullName,
      phone: manager.phone,
      email: manager.email,
      position: manager.position,
      kebele: {
        id: manager.kebele.id,
        kebeleName: manager.kebele.kebeleName,
        kebeleNumber: manager.kebele.kebeleNumber
      }
    });
  } catch (error) {
    console.error('Error authenticating kebele manager:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 