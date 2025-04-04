import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { Parser } from 'json2csv';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: session.user.id }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const entityType = searchParams.get('entityType');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      coordinatorId: coordinator.id
    };

    if (search) {
      where.OR = [
        { changeDetails: { contains: search, mode: 'insensitive' } },
        { client: { fullName: { contains: search, mode: 'insensitive' } } },
        { case: { title: { contains: search, mode: 'insensitive' } } },
        { document: { title: { contains: search, mode: 'insensitive' } } },
        { serviceRequest: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (action && action !== 'all') {
      where.action = action;
    }

    if (startDate && endDate) {
      where.changedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (entityType && entityType !== 'all') {
      where[`${entityType}Id`] = { not: null };
    }

    if (status && status !== 'all') {
      where[`${entityType}.status`] = status;
    }

    // Fetch history entries
    const historyEntries = await prisma.coordinatorHistory.findMany({
      where,
      include: {
        client: true,
        case: true,
        lawyer: true,
        office: true,
        document: true,
        appointment: true,
        serviceRequest: true
      },
      orderBy: {
        changedAt: 'desc'
      }
    });

    // Format data for CSV
    const csvData = historyEntries.map(entry => ({
      'Action': entry.action,
      'Change Details': entry.changeDetails,
      'Date': format(new Date(entry.changedAt), 'PPpp'),
      'Client': entry.client?.fullName || '',
      'Case': entry.case?.title || '',
      'Document': entry.document?.title || '',
      'Appointment': entry.appointment ? format(new Date(entry.appointment.scheduledTime), 'PPpp') : '',
      'Service Request': entry.serviceRequest?.title || '',
      'Previous Value': JSON.stringify(entry.previousValue),
      'New Value': JSON.stringify(entry.newValue),
      'Status': entry.client?.status || entry.case?.status || entry.serviceRequest?.status || ''
    }));

    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(csvData);

    // Create response with CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="coordinator-history-${format(new Date(), 'yyyy-MM-dd')}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting history:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 