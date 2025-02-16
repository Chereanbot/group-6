import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OTPType } from '@prisma/client';
import { generateOTP, sendSMS } from '@/utils/helpers';

export async function POST(request: Request) {
  try {
    const { userId, type } = await request.json();

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create new OTP record
    await prisma.oTPVerification.create({
      data: {
        userId,
        otp,
        type: type as OTPType,
        expiresAt
      }
    });

    // Send OTP based on type
    if (type === 'PHONE') {
      await sendSMS(user.phone!, `Your verification code is: ${otp}`);
    } else {
      // Implement email sending here
      console.log('Send email:', otp);
    }

    return NextResponse.json({
      message: `OTP sent to your ${type.toLowerCase()}`
    });

  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { message: 'Failed to resend OTP' },
      { status: 500 }
    );
  }
} 