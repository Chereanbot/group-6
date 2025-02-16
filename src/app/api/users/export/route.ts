import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds, format } = body;

    if (!userIds || !userIds.length) {
      return NextResponse.json(
        { error: 'No users selected for export' },
        { status: 400 }
      );
    }

    // Get users data
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        userRole: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Format the data based on requested format
    switch (format) {
      case 'json': {
        return new NextResponse(JSON.stringify(users, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=users-export.json'
          }
        });
      }

      case 'csv': {
        const fields = ['id', 'email', 'fullName', 'phone', 'userRole', 'status', 'emailVerified', 'phoneVerified', 'createdAt', 'updatedAt'];
        const parser = new Parser({ fields });
        const csv = parser.parse(users);
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=users-export.csv'
          }
        });
      }

      case 'excel': {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Add headers
        worksheet.columns = [
          { header: 'ID', key: 'id' },
          { header: 'Email', key: 'email' },
          { header: 'Full Name', key: 'fullName' },
          { header: 'Phone', key: 'phone' },
          { header: 'Role', key: 'userRole' },
          { header: 'Status', key: 'status' },
          { header: 'Email Verified', key: 'emailVerified' },
          { header: 'Phone Verified', key: 'phoneVerified' },
          { header: 'Created At', key: 'createdAt' },
          { header: 'Updated At', key: 'updatedAt' }
        ];

        // Add rows
        worksheet.addRows(users);

        const buffer = await workbook.xlsx.writeBuffer();
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=users-export.xlsx'
          }
        });
      }

      case 'pdf': {
        const doc = new PDFDocument();
        let buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        
        // Add title
        doc.fontSize(16).text('Users Export', { align: 'center' });
        doc.moveDown();

        // Add user data
        users.forEach((user, index) => {
          doc.fontSize(12).text(`User ${index + 1}:`);
          doc.fontSize(10)
            .text(`ID: ${user.id}`)
            .text(`Name: ${user.fullName}`)
            .text(`Email: ${user.email}`)
            .text(`Phone: ${user.phone || 'N/A'}`)
            .text(`Role: ${user.userRole}`)
            .text(`Status: ${user.status}`)
            .text(`Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`)
            .text(`Phone Verified: ${user.phoneVerified ? 'Yes' : 'No'}`)
            .text(`Created At: ${new Date(user.createdAt).toLocaleString()}`)
            .text(`Updated At: ${new Date(user.updatedAt).toLocaleString()}`);
          doc.moveDown();
        });

        doc.end();

        return new Promise((resolve) => {
          doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(new NextResponse(pdfBuffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=users-export.pdf'
              }
            }));
          });
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to export users',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 