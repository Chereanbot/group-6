import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum } from '@prisma/client';

export async function POST(req: Request) {
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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const nameIndex = headers.indexOf('Name');
    const categoryIndex = headers.indexOf('Category');
    const descriptionIndex = headers.indexOf('Description');
    const subFieldsIndex = headers.indexOf('Sub Fields');

    if (nameIndex === -1 || categoryIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Invalid CSV format. Required columns: Name, Category" },
        { status: 400 }
      );
    }

    const specializations = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      
      try {
        const name = values[nameIndex];
        const category = values[categoryIndex];
        const description = descriptionIndex !== -1 ? values[descriptionIndex] : '';
        const subFields = subFieldsIndex !== -1 
          ? values[subFieldsIndex].split(';').map(f => f.trim())
          : [];

        if (!name || !category) {
          errors.push(`Row ${i + 1}: Name and Category are required`);
          continue;
        }

        // Check if specialization already exists
        const existing = await prisma.legalSpecialization.findFirst({
          where: { name }
        });

        if (existing) {
          errors.push(`Row ${i + 1}: Specialization "${name}" already exists`);
          continue;
        }

        specializations.push({
          name,
          category,
          description,
          subFields
        });
      } catch (error) {
        errors.push(`Row ${i + 1}: Invalid format`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Import completed with errors",
          errors 
        },
        { status: 400 }
      );
    }

    // Create all specializations
    await prisma.$transaction(
      specializations.map(spec => 
        prisma.legalSpecialization.create({
          data: spec
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${specializations.length} specializations`
    });

  } catch (error) {
    console.error('Error importing specializations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to import specializations',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 