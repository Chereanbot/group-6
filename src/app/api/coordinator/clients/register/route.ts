import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Prisma, UserRoleEnum, UserStatus, DocumentType, DocumentStatus } from '@prisma/client';
import { verifyAuth } from '@/lib/edge-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

// Define enums that match the database
enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DISABLED = 'DISABLED',
  CHRONIC_ILLNESS = 'CHRONIC_ILLNESS',
  OTHER = 'OTHER'
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: { office: true }
    });

    if (!coordinator) {
      return NextResponse.json(
        { success: false, message: 'Coordinator not found' },
        { status: 404 }
      );
    }

    if (!coordinator.office || coordinator.office.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Coordinator office is not active' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    // Extract basic client information
    const fullName = formData.get('fullName') as string;
    const phones = JSON.parse(formData.get('phones') as string);
    const age = Number(formData.get('age'));
    const sex = formData.get('sex') as Gender;
    const numberOfFamily = Number(formData.get('numberOfFamily'));
    const healthStatus = formData.get('healthStatus') as HealthStatus;
    
    // Extract location details
    const region = formData.get('region') as string;
    const zone = formData.get('zone') as string;
    const wereda = formData.get('wereda') as string;
    const kebele = formData.get('kebele') as string;
    const houseNumber = formData.get('houseNumber') as string;
    
    // Extract case information
    const caseType = formData.get('caseType') as string;
    const caseCategory = formData.get('caseCategory') as string;
    const additionalNotes = formData.get('additionalNotes') as string;
    
    // Get documents from form data
    const documents = JSON.parse(formData.get('documents') as string);

    // Validate required fields
    if (!fullName || !phones || !phones.length || !age || !sex || !numberOfFamily || 
        !healthStatus || !region || !zone || !wereda || !kebele || 
        !caseType || !caseCategory) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for required identification document
    const hasIdentification = documents.some(
      (doc: any) => doc.type === 'IDENTIFICATION' && formData.get(doc.type)
    );

    if (!hasIdentification) {
      return NextResponse.json(
        { success: false, message: 'Identification document is required' },
        { status: 400 }
      );
    }

    // Generate temporary email and password
    const tempEmail = `${fullName.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@temp.dulas.edu.et`;
    const tempPassword = Math.random().toString(36).slice(-8);

    try {
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user first
        const user = await tx.user.create({
          data: {
            fullName,
            phone: phones[0],
            email: tempEmail,
            password: tempPassword,
            userRole: UserRoleEnum.CLIENT,
            status: UserStatus.ACTIVE
          }
        });

        // Create client profile
        const clientProfile = await tx.ClientProfile.create({
          data: {
            userId: user.id,
            age: Number(age),
            sex: sex as Gender,
            phone: phones[0],
            numberOfFamily: Number(numberOfFamily),
            healthStatus: healthStatus as HealthStatus,
            region,
            zone,
            wereda,
            kebele,
            houseNumber,
            caseType,
            caseCategory,
            officeId: coordinator.officeId
          }
        });

        // Handle document uploads
        const uploadedDocs = [];
        for (const doc of documents) {
          const fileData = formData.get(doc.type) as File;
          if (fileData) {
            const fileName = `${uuidv4()}-${fileData.name}`;
            const filePath = join(uploadsDir, fileName);
            const buffer = Buffer.from(await fileData.arrayBuffer());
            await writeFile(filePath, buffer);

            // Find or create the kebele record
            let kebeleRecord = await tx.kebele.findFirst({
              where: {
                OR: [
                  { kebeleNumber: kebele },
                  { kebeleName: kebele }
                ]
              },
              select: {
                id: true
              }
            });

            if (!kebeleRecord) {
              // Create a new kebele record if one doesn't exist
              kebeleRecord = await tx.kebele.create({
                data: {
                  kebeleNumber: kebele,
                  kebeleName: kebele,
                  mainOffice: coordinator.officeId,
                  contactPhone: phones[0],
                  services: [],
                  status: 'ACTIVE'
                },
                select: {
                  id: true
                }
              });
            }

            const document = await tx.document.create({
              data: {
                title: doc.type,
                description: doc.notes || undefined,
                type: doc.type as DocumentType,
                status: DocumentStatus.PENDING,
                path: `/uploads/${fileName}`,
                size: fileData.size,
                mimeType: fileData.type,
                uploadedBy: user.id,
                kebeleId: kebeleRecord.id
              }
            });

            uploadedDocs.push(document);
          }
        }

        return { 
          ...user,
          clientProfile,
          documents: uploadedDocs 
        };
      });

      return NextResponse.json({
        success: true,
        data: result
      });

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database transaction failed',
          error: transactionError instanceof Error ? transactionError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch coordinator's office
export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1] || 
                 headersList.get('cookie')?.split('; ')
                 .find(row => row.startsWith('auth-token='))
                 ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isAuthenticated, payload } = await verifyAuth(token);

    if (!isAuthenticated || !payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get coordinator's office
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: payload.id },
      include: {
        office: {
          select: {
            id: true,
            name: true,
            location: true,
            type: true,
            status: true
          }
        }
      }
    });

    if (!coordinator || !coordinator.office) {
      return NextResponse.json(
        { success: false, message: 'Coordinator or office not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: [coordinator.office] // Return as array for compatibility
    });

  } catch (error) {
    console.error('Error fetching coordinator office:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch office information' },
      { status: 500 }
    );
  }
} 