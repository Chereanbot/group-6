import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, RequestStatus } from '@prisma/client';
import * as XLSX from 'xlsx';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  metadata: {
    price: number;
    [key: string]: any;
  };
  submittedAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

// Format currency in ETB
const formatETB = (amount: number) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(amount);
};

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

    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || user.userRole !== UserRoleEnum.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Fetch payment requests with filters
    const requests = await prisma.serviceRequest.findMany({
      where: {
        paymentStatus: { not: null },
        ...(status && status !== 'all' ? { status: status as RequestStatus } : {}),
        ...(search ? {
          OR: [
            { client: { fullName: { contains: search, mode: 'insensitive' } } },
            { client: { email: { contains: search, mode: 'insensitive' } } },
            { id: { contains: search, mode: 'insensitive' } }
          ]
        } : {}),
        ...(startDate && endDate ? {
          submittedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {})
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    }) as unknown as ServiceRequest[];

    // Filter results by amount in memory since Prisma JSON filtering is limited
    const filteredRequests = requests.filter(request => {
      const price = request.metadata?.price || 0;
      if (minAmount && price < parseFloat(minAmount)) return false;
      if (maxAmount && price > parseFloat(maxAmount)) return false;
      return true;
    });

    // Transform data for Excel
    const excelData = filteredRequests.map(request => ({
      'Reference Number': request.id,
      'Client Name': request.client.fullName,
      'Client Email': request.client.email,
      'Client Phone': request.client.phone,
      'Service': request.title,
      'Description': request.description,
      'Amount (ETB)': formatETB(request.metadata?.price || 0),
      'Status': request.status,
      'Submitted At': request.submittedAt.toLocaleString(),
      'Updated At': request.updatedAt.toLocaleString()
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add column widths
    const colWidths = [
      { wch: 15 }, // Reference Number
      { wch: 20 }, // Client Name
      { wch: 25 }, // Client Email
      { wch: 15 }, // Client Phone
      { wch: 20 }, // Service
      { wch: 30 }, // Description
      { wch: 15 }, // Amount
      { wch: 10 }, // Status
      { wch: 20 }, // Submitted At
      { wch: 20 }  // Updated At
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Payment Requests');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as Excel file
    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=payment-requests-${new Date().toISOString().split('T')[0]}.xlsx`
      }
    });

  } catch (error) {
    console.error('Error exporting payment requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to export payment requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 