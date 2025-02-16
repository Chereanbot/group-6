import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppealStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.getAll('status') as AppealStatus[];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const searchTerm = searchParams.get('searchTerm');

    const where = {
      ...(status.length > 0 && { status: { in: status } }),
      ...(startDate && { filedDate: { gte: new Date(startDate) } }),
      ...(endDate && { filedDate: { lte: new Date(endDate) } }),
      ...(searchTerm && {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
    };

    const appeals = await prisma.appeal.findMany({
      where,
      include: {
        case: {
          select: {
            title: true,
            status: true,
            priority: true
          }
        },
        filer: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        documents: true
      },
      orderBy: {
        filedDate: 'desc'
      }
    });

    return NextResponse.json(appeals);
  } catch (error) {
    console.error('Error fetching appeals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appeals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = JSON.parse(formData.get('data') as string);
    const documents = formData.getAll('documents') as File[];

    const appeal = await prisma.appeal.create({
      data: {
        caseId: data.caseId,
        title: data.title,
        description: data.description,
        status: 'PENDING',
        filedBy: 'current-user-id', // Replace with actual user ID from session
        filedDate: new Date(),
        documents: {
          create: documents.map(doc => ({
            title: doc.name,
            path: '/uploads/' + doc.name, // Replace with actual file upload logic
            uploadedAt: new Date()
          }))
        }
      },
      include: {
        case: true,
        documents: true
      }
    });

    return NextResponse.json(appeal);
  } catch (error) {
    console.error('Error creating appeal:', error);
    return NextResponse.json(
      { error: 'Failed to create appeal' },
      { status: 500 }
    );
  }
} 