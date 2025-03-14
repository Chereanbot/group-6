import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UserRoleEnum } from '@prisma/client';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const lawyerProfiles = await prisma.lawyerProfile.findMany({
      where: {
        availability: true,
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        experience: true,
        rating: true,
        caseLoad: true,
        office: {
          select: {
            name: true,
          },
        },
        specializations: {
          select: {
            specialization: {
              select: {
                name: true,
              },
            },
          },
        },
        yearsOfPractice: true,
        barAdmissionDate: true,
        primaryJurisdiction: true,
        languages: true,
        certifications: true,
      },
      orderBy: {
        yearsOfPractice: 'desc',
      },
    });

    const transformedLawyers = lawyerProfiles.map(profile => ({
      id: profile.userId,
      name: profile.user.fullName,
      specializations: profile.specializations
        .map(s => s.specialization.name)
        .join(', '),
      office: profile.office?.name || 'No Office Assigned',
      experience: profile.experience,
      yearsOfPractice: profile.yearsOfPractice,
      rating: profile.rating || 0,
      caseLoad: profile.caseLoad,
      barAdmissionDate: profile.barAdmissionDate,
      primaryJurisdiction: profile.primaryJurisdiction,
      languages: profile.languages.join(', '),
      certifications: profile.certifications.join(', '),
    }));

    return NextResponse.json(transformedLawyers);
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}