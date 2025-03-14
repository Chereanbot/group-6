import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export async function POST(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const filter = await request.json();

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      // Add headers
      worksheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 15 },
      ];

      // Add data
      worksheet.addRows([
        { metric: 'Total Cases', value: filter.caseMetrics?.total || 0 },
        { metric: 'Resolved Cases', value: filter.caseMetrics?.resolved || 0 },
        { metric: 'Pending Cases', value: filter.caseMetrics?.pending || 0 },
        { metric: 'Total Users', value: filter.userMetrics?.totalUsers || 0 },
        { metric: 'Active Users', value: filter.userMetrics?.activeUsers || 0 },
        { metric: 'Total Documents', value: filter.documentMetrics?.total || 0 },
        { metric: 'Verified Documents', value: filter.documentMetrics?.verified || 0 },
        { metric: 'Pending Documents', value: filter.documentMetrics?.pending || 0 },
        { metric: 'Average Resolution Time (days)', value: filter.performanceMetrics?.avgResolutionTime || 0 },
        { metric: 'Satisfaction Rate (%)', value: filter.performanceMetrics?.satisfactionRate || 0 },
        { metric: 'Completion Rate (%)', value: filter.performanceMetrics?.completionRate || 0 },
      ]);

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=report.xlsx',
        },
      });
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {});

      // Add title
      doc.fontSize(20).text('Performance Report', { align: 'center' });
      doc.moveDown();

      // Add date range
      doc.fontSize(12).text(`Period: ${new Date(filter.startDate).toLocaleDateString()} - ${new Date(filter.endDate).toLocaleDateString()}`);
      doc.moveDown();

      // Add metrics
      const metrics = [
        { label: 'Total Cases', value: filter.caseMetrics?.total || 0 },
        { label: 'Resolved Cases', value: filter.caseMetrics?.resolved || 0 },
        { label: 'Pending Cases', value: filter.caseMetrics?.pending || 0 },
        { label: 'Total Users', value: filter.userMetrics?.totalUsers || 0 },
        { label: 'Active Users', value: filter.userMetrics?.activeUsers || 0 },
        { label: 'Total Documents', value: filter.documentMetrics?.total || 0 },
        { label: 'Verified Documents', value: filter.documentMetrics?.verified || 0 },
        { label: 'Pending Documents', value: filter.documentMetrics?.pending || 0 },
        { label: 'Average Resolution Time (days)', value: filter.performanceMetrics?.avgResolutionTime || 0 },
        { label: 'Satisfaction Rate (%)', value: filter.performanceMetrics?.satisfactionRate || 0 },
        { label: 'Completion Rate (%)', value: filter.performanceMetrics?.completionRate || 0 },
      ];

      metrics.forEach(({ label, value }) => {
        doc.text(`${label}: ${value}`);
        doc.moveDown(0.5);
      });

      doc.end();

      const pdfBuffer = Buffer.concat(buffers);

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=report.pdf',
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid export format" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Report Export API Error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 