import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
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
            name: true,
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
      name: profile.user.name,
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