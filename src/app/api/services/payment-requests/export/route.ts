import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { UserRoleEnum, PaymentStatus } from '@prisma/client';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import { format as formatDate } from 'date-fns';

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

    const { searchParams } = new URL(req.url);
    const exportFormat = searchParams.get('format') || 'csv';

    // Fetch all payment requests with related data
    const requests = await prisma.serviceRequest.findMany({
      where: {
        paymentStatus: { not: null }
      },
      include: {
        client: {
          include: {
            clientProfile: {
              select: {
                region: true,
                zone: true,
                wereda: true,
                kebele: true
              }
            }
          }
        },
        assignedLawyer: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Transform data for export
    const exportData = requests.map(request => ({
      referenceNumber: request.id,
      clientName: request.client.fullName,
      clientEmail: request.client.email,
      clientPhone: request.client.phone,
      region: request.client.clientProfile?.region || 'N/A',
      zone: request.client.clientProfile?.zone || 'N/A',
      wereda: request.client.clientProfile?.wereda || 'N/A',
      kebele: request.client.clientProfile?.kebele || 'N/A',
      serviceName: request.title,
      amount: (request.metadata as any)?.price || request.quotedPrice || 0,
      status: request.paymentStatus,
      assignedLawyer: request.assignedLawyer?.fullName || 'Unassigned',
      createdAt: request.submittedAt ? formatDate(request.submittedAt, 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      processedAt: request.completedAt ? formatDate(request.completedAt, 'yyyy-MM-dd HH:mm:ss') : 'Pending'
    }));

    if (exportFormat === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Payment Requests');

      // Add headers
      worksheet.columns = [
        { header: 'Reference', key: 'referenceNumber' },
        { header: 'Client Name', key: 'clientName' },
        { header: 'Client Email', key: 'clientEmail' },
        { header: 'Client Phone', key: 'clientPhone' },
        { header: 'Region', key: 'region' },
        { header: 'Zone', key: 'zone' },
        { header: 'Wereda', key: 'wereda' },
        { header: 'Kebele', key: 'kebele' },
        { header: 'Service', key: 'serviceName' },
        { header: 'Amount', key: 'amount' },
        { header: 'Status', key: 'status' },
        { header: 'Assigned Lawyer', key: 'assignedLawyer' },
        { header: 'Created At', key: 'createdAt' },
        { header: 'Processed At', key: 'processedAt' }
      ];

      // Add data
      worksheet.addRows(exportData);

      // Style the worksheet
      worksheet.getRow(1).font = { bold: true };
      worksheet.columns.forEach(column => {
        column.width = 15;
      });

      // Generate Excel buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="payment-requests-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      });
    } else {
      // Generate CSV
      const parser = new Parser();
      const csv = parser.parse(exportData);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-requests-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

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