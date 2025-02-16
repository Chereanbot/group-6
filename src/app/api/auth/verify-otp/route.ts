import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OTPType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { userId, otp, type } = await request.json();

    // Find and validate OTP
    const otpVerification = await prisma.oTPVerification.findFirst({
      where: {
        userId,
        otp,
        type: type as OTPType,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!otpVerification) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma.oTPVerification.update({
      where: { id: otpVerification.id },
      data: { verified: true }
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: userId },
      data: {
        [type.toLowerCase() + 'Verified']: true
      }
    });

    return NextResponse.json({
      message: 'OTP verified successfully'
    });

  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
} 