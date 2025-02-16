import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateOTP } from '@/utils/helpers';
import { OTPType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, phone, password, fullName, username } = body;

    // Validate required fields
    if (!email || !phone || !password || !fullName || !username) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 400 }
        );
      }
      if (existingUser.phone === phone) {
        return NextResponse.json(
          { message: 'Phone number already registered' },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        fullName,
        username
      }
    });

    // Generate OTPs for both email and phone
    const emailOTP = generateOTP();
    const phoneOTP = generateOTP();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Create OTP records
    await Promise.all([
      prisma.oTPVerification.create({
        data: {
          userId: user.id,
          otp: emailOTP,
          type: OTPType.EMAIL,
          expiresAt
        }
      }),
      prisma.oTPVerification.create({
        data: {
          userId: user.id,
          otp: phoneOTP,
          type: OTPType.PHONE,
          expiresAt
        }
      })
    ]);

    // For development, log the OTPs
    console.log('Email OTP:', emailOTP);
    console.log('Phone OTP:', phoneOTP);

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your email and phone.',
      userId: user.id,
      verifyType: 'EMAIL' // Start with email verification
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Registration failed' 
      },
      { status: 500 }
    );
  }
} 