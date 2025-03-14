import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { smsService } from '@/lib/sms/service';
import { UserRoleEnum } from '@prisma/client';

export async function POST(req: Request) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please login first" },
        { status: 401 }
      );
    }

    // Verify authentication and check coordinator role
    const { isAuthenticated, user } = await verifyAuth(token);

    if (!isAuthenticated || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if user is a coordinator
    if (user.userRole !== UserRoleEnum.COORDINATOR) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Only coordinators can send SMS" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { recipients, message, templateId } = body;

    if (!recipients || !message) {
      return NextResponse.json(
        { error: 'Recipients and message are required' },
        { status: 400 }
      );
    }

    // Send SMS to all recipients
    const result = await smsService.sendBulkSms(
      recipients.map((r: any) => ({
        phone: r.phone,
        name: r.fullName || 'Recipient'
      })),
      message,
      user.id // Pass the sender's ID
    );

    return NextResponse.json({
      success: result.success,
      results: result.results,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
} 