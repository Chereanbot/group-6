import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const authResult = await verifyAuth(token);

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all active kebele members
    const kebeleMembers = await prisma.resident.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        kebele: {
          select: {
            id: true,
            kebeleName: true,
            kebeleNumber: true,
            subCity: true,
            district: true,
            contactPhone: true,
            contactEmail: true,
            workingHours: true,
            services: true,
            status: true
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            path: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include only necessary information
    const transformedMembers = kebeleMembers.map(member => ({
      id: member.id,
      fullName: member.fullName,
      phone: member.phone,
      email: member.email,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth,
      nationality: member.nationality,
      occupation: member.occupation,
      maritalStatus: member.maritalStatus,
      residentType: member.residentType,
      registrationDate: member.createdAt,
      status: member.status,
      kebele: {
        id: member.kebele.id,
        name: member.kebele.kebeleName,
        number: member.kebele.kebeleNumber,
        subCity: member.kebele.subCity,
        district: member.kebele.district
      },
      documents: member.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        path: doc.path,
        uploadedAt: doc.createdAt
      }))
    }));

    return NextResponse.json(transformedMembers);
  } catch (error) {
    console.error('Error fetching kebele members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kebele members' },
      { status: 500 }
    );
  }
} 