import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const registrationSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email().optional(),
  age: z.coerce.number().min(18, 'Must be at least 18 years old'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),

  // Location Information
  region: z.string().min(1, 'Region is required'),
  zone: z.string().min(1, 'Zone is required'),
  wereda: z.string().min(1, 'Wereda is required'),
  kebele: z.string().min(1, 'Kebele is required'),
  houseNumber: z.string().optional(),

  // Case Information
  caseType: z.enum(['CIVIL', 'CRIMINAL', 'FAMILY', 'PROPERTY', 'LABOR', 'COMMERCIAL', 'CONSTITUTIONAL', 'ADMINISTRATIVE', 'OTHER']),
  caseCategory: z.enum(['FAMILY', 'CRIMINAL', 'CIVIL', 'PROPERTY', 'LABOR', 'COMMERCIAL', 'CONSTITUTIONAL', 'ADMINISTRATIVE', 'OTHER']),
  caseDescription: z.string().min(10, 'Case description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),

  // Office Information
  officeId: z.string().min(1, 'Office selection is required'),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    // Log only essential information
    console.log('Processing registration for:', {
      fullName: data.fullName,
      caseType: data.caseType,
      documentsCount: Array.from(formData.entries()).filter(([key]) => key.startsWith('document_')).length
    });
    
    // Validate the form data
    const validatedData = registrationSchema.parse(data);

    // Generate a unique email if not provided
    const userEmail = validatedData.email || `${validatedData.phone}_${Date.now()}@placeholder.com`;

    // Check if user already exists with either email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { phone: validatedData.phone }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'A user with this phone number or email already exists. Please use different contact information or try logging in.',
      }, { status: 400 });
    }

    // Get the uploaded documents
    const documents = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('document_'))
      .map(([_, file]) => file as File);

    // Create User record with a ClientProfile
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        phone: validatedData.phone,
        fullName: validatedData.fullName,
        password: 'temporary_password',
        userRole: 'CLIENT',
        clientProfile: {
          create: {
            phone: validatedData.phone,
            age: validatedData.age,
            sex: validatedData.gender,
            numberOfFamily: 0,
            healthStatus: 'HEALTHY',
            region: validatedData.region,
            zone: validatedData.zone,
            wereda: validatedData.wereda,
            kebele: validatedData.kebele,
            houseNumber: validatedData.houseNumber || '',
            caseType: validatedData.caseType,
            caseCategory: validatedData.caseCategory,
            officeId: validatedData.officeId
          }
        }
      },
      include: {
        clientProfile: true
      }
    });

    // Create the case
    const case_ = await prisma.case.create({
      data: {
        title: `Case ${Date.now()}`,
        description: validatedData.caseDescription,
        priority: validatedData.priority,
        status: 'PENDING',
        category: validatedData.caseCategory,
        clientName: validatedData.fullName,
        clientPhone: validatedData.phone,
        wereda: validatedData.wereda,
        kebele: validatedData.kebele,
        region: validatedData.region,
        zone: validatedData.zone,
        clientRequest: validatedData.caseDescription,
        clientId: user.id
      }
    });

    // Handle document uploads
    if (documents.length > 0) {
      // TODO: Implement document storage logic
      // This could involve uploading to a cloud storage service
      // and storing the references in the database
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        case: case_
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      }, { status: 400 });
    }

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json({
        success: false,
        message: `This ${field} is already registered. Please use a different ${field} or try logging in.`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to process registration'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch available offices
    const offices = await prisma.office.findMany({
      select: {
        id: true,
        name: true,
        location: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: offices
    });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch offices'
    }, { status: 500 });
  }
} 