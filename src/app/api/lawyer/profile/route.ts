import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can access profile' },
        { status: 403 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        lawyerProfile: {
          select: {
            id: true,
            experience: true,
            rating: true,
            caseLoad: true,
            availability: true,
            office: {
              select: {
                id: true,
                name: true,
                location: true,
                contactEmail: true,
                contactPhone: true
              }
            }
          }
        }
      }
    });

    if (!profile || !profile.lawyerProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error fetching lawyer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login first' },
        { status: 401 }
      );
    }

    if (userRole !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Unauthorized: Only lawyers can update profile' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { phone, experience, availability } = data;

    // Update user profile
    const updatedProfile = await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        lawyerProfile: {
          update: {
            experience,
            availability
          }
        }
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
        lawyerProfile: {
          select: {
            id: true,
            experience: true,
            rating: true,
            caseLoad: true,
            availability: true,
            office: {
              select: {
                id: true,
                name: true,
                location: true,
                contactEmail: true,
                contactPhone: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error('Error updating lawyer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 