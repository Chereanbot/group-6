import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { isAuthenticated } = await verifyAuth(token);

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all specializations with their relationships
    const specializations = await prisma.legalSpecialization.findMany({
      include: {
        lawyers: {
          include: {
            lawyer: true
          }
        }
      }
    });

    // Convert to CSV format
    const headers = ['Name', 'Category', 'Description', 'Sub Fields', 'Number of Lawyers'];
    const rows = specializations.map(spec => [
      spec.name,
      spec.category,
      spec.description || '',
      spec.subFields.join('; '),
      spec.lawyers.length.toString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Return as CSV file
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=specializations.csv'
      }
    });

  } catch (error) {
    console.error('Error exporting specializations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to export specializations',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 