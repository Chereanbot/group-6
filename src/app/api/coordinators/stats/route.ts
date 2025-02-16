import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [total, active, inactive, suspended] = await Promise.all([
      prisma.coordinator.count(),
      prisma.coordinator.count({ where: { status: 'ACTIVE' } }),
      prisma.coordinator.count({ where: { status: 'INACTIVE' } }),
      prisma.coordinator.count({ where: { status: 'SUSPENDED' } })
    ]);

    return NextResponse.json({
      total,
      active,
      inactive,
      suspended
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 