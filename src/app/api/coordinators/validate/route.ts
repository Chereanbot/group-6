import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!data.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else {
      // Check if email is already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        errors.email = 'Email is already in use';
      }
    }

    if (!data.password || data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Office validation
    if (!data.officeId) {
      errors.office = 'Office selection is required';
    } else {
      const office = await prisma.office.findUnique({
        where: { id: data.officeId }
      });

      if (!office) {
        errors.office = 'Selected office does not exist';
      }
    }

    // Type validation
    if (!data.type || !['PERMANENT', 'PROJECT_BASED'].includes(data.type)) {
      errors.type = 'Valid coordinator type is required';
    }

    // Start date validation
    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    }

    // End date validation for project-based
    if (data.type === 'PROJECT_BASED' && !data.endDate) {
      errors.endDate = 'End date is required for project-based coordinators';
    }

    // Specialties validation
    if (!data.specialties?.length) {
      errors.specialties = 'At least one specialty is required';
    }

    return NextResponse.json({
      valid: Object.keys(errors).length === 0,
      errors
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { 
        valid: false, 
        errors: { general: 'Validation failed' } 
      },
      { status: 400 }
    );
  }
} 