import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import based on your project structure

export async function POST(request: Request) {
  const data = await request.json();

  // Validate incoming data
  const { fullName, email, phone, licenseNumber, specialization, employeeId, department, academicRank, maxCaseload, availabilityHours, certifications, yearsOfExperience, teachingSchedule, workHoursPerWeek, timeline } = data;

  if (!fullName || !email || !employeeId || !department) {
    return NextResponse.json({ success: false, message: 'Required fields are missing.' }, { status: 400 });
  }

  try {
    // Create a new faculty member in the database
    const newFaculty = await prisma.faculty.create({
      data: {
        fullName,
        email,
        phone,
        licenseNumber,
        specialization,
        employeeId,
        department,
        academicRank,
        maxCaseload,
        availabilityHours,
        certifications,
        yearsOfExperience,
        teachingSchedule,
        workHoursPerWeek,
        timeline,
      },
    });

    return NextResponse.json({ success: true, data: newFaculty }, { status: 201 });
  } catch (error) {
    console.error('Error creating faculty member:', error);
    return NextResponse.json({ success: false, message: 'Failed to create faculty member.' }, { status: 500 });
  }
} 