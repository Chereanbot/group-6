import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

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
    const { userId, type, directVerify } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
        fullName: true,
        emailVerified: true,
        phoneVerified: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (directVerify) {
      // Direct verification
      const updateData = type === 'email' 
        ? { emailVerified: true }
        : { phoneVerified: true };

      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });

      return NextResponse.json({
        success: true,
        message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully`
      });
    } else {
      // Send verification email
      if (user.emailVerified) {
        return NextResponse.json(
          { error: 'User is already verified' },
          { status: 400 }
        );
      }

      await sendVerificationEmail(user.email, user.fullName);

      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    }

  } catch (error) {
    console.error('Error in verification process:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process verification',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 