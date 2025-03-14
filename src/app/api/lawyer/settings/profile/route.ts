import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getAuthHeaders, checkLawyerAuth } from "@/lib/auth-utils";

const profileSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
  languages: z.array(z.string()),
  certifications: z.array(z.string()),
  yearsOfPractice: z.number().min(0),
  barAdmissionDate: z.string().optional(),
  primaryJurisdiction: z.string().optional(),
  availability: z.boolean(),
});

export async function GET() {
  try {
    const headers = await getAuthHeaders();
    const authError = checkLawyerAuth(headers, "profile settings");
    if (authError) return authError;

    const profile = await prisma.user.findUnique({
      where: { id: headers.userId! },
      include: {
        lawyerProfile: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      languages: profile.lawyerProfile?.languages || [],
      certifications: profile.lawyerProfile?.certifications || [],
      yearsOfPractice: profile.lawyerProfile?.yearsOfPractice || 0,
      barAdmissionDate: profile.lawyerProfile?.barAdmissionDate,
      primaryJurisdiction: profile.lawyerProfile?.primaryJurisdiction,
      availability: profile.lawyerProfile?.availability || false,
    });
  } catch (error) {
    console.error("[LAWYER_PROFILE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const headers = await getAuthHeaders();
    const authError = checkLawyerAuth(headers, "profile settings");
    if (authError) return authError;

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // First update the user
    const user = await prisma.user.update({
      where: { id: headers.userId! },
      data: {
        fullName: validatedData.fullName,
        phone: validatedData.phone,
      },
    });

    // Then update or create the lawyer profile
    const lawyerProfile = await prisma.lawyerProfile.upsert({
      where: { userId: headers.userId! },
      create: {
        userId: headers.userId!,
        languages: validatedData.languages,
        certifications: validatedData.certifications,
        yearsOfPractice: validatedData.yearsOfPractice,
        barAdmissionDate: validatedData.barAdmissionDate ? new Date(validatedData.barAdmissionDate) : null,
        primaryJurisdiction: validatedData.primaryJurisdiction,
        availability: validatedData.availability,
        experience: validatedData.yearsOfPractice,
      },
      update: {
        languages: validatedData.languages,
        certifications: validatedData.certifications,
        yearsOfPractice: validatedData.yearsOfPractice,
        barAdmissionDate: validatedData.barAdmissionDate ? new Date(validatedData.barAdmissionDate) : null,
        primaryJurisdiction: validatedData.primaryJurisdiction,
        availability: validatedData.availability,
        experience: validatedData.yearsOfPractice,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        ...user,
        lawyerProfile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[LAWYER_PROFILE_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 