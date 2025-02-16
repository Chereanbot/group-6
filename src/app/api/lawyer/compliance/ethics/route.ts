import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [requirements, trainings, certifications] = await Promise.all([
      prisma.ethicsRequirement.findMany({
        where: {
          // Add user-specific conditions
        },
        orderBy: {
          dueDate: 'asc'
        }
      }),
      prisma.training.findMany({
        where: {
          // Add user-specific conditions
        },
        orderBy: {
          expiryDate: 'asc'
        }
      }),
      prisma.certification.findMany({
        where: {
          // Add user-specific conditions
        },
        orderBy: {
          expiryDate: 'asc'
        }
      })
    ]);

    return NextResponse.json({
      requirements,
      trainings,
      certifications,
      summary: {
        totalRequirements: requirements.length,
        completedRequirements: requirements.filter(r => r.status === 'completed').length,
        activeTrainings: trainings.filter(t => t.status === 'in-progress').length,
        validCertifications: certifications.filter(c => c.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Error fetching ethics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ethics data' },
      { status: 500 }
    );
  }
} 