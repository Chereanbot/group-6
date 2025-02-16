import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRoleEnum } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Check if test lawyer already exists
    const existingLawyer = await prisma.user.findFirst({
      where: {
        email: 'test.lawyer@example.com'
      }
    });

    if (existingLawyer) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Test lawyer already exists' 
        }),
        { status: 400 }
      );
    }

    // Create test lawyer
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const lawyer = await prisma.user.create({
      data: {
        email: 'test.lawyer@example.com',
        fullName: 'Test Lawyer',
        password: hashedPassword,
        userRole: UserRoleEnum.LAWYER,
        lawyerProfile: {
          create: {
            specializations: ['Criminal Law', 'Family Law'],
            experience: 5,
            phoneNumber: '+1234567890'
          }
        }
      },
      include: {
        lawyerProfile: true
      }
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        lawyer 
      }),
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Failed to create test lawyer:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to create test lawyer' 
      }),
      { status: 500 }
    );
  }
} 