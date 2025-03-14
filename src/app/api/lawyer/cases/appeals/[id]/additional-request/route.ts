import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const additionalRequestSchema = z.object({
  additionalRequest: z.string().min(1, "Additional request is required"),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the appeal ID from params
    const appealId = await Promise.resolve(params.id);
    const body = await request.json();
    const validatedData = additionalRequestSchema.parse(body);

    // Check if appeal exists and belongs to the lawyer
    const appeal = await prisma.appeal.findFirst({
      where: {
        id: appealId,
      },
    });

    if (!appeal) {
      return NextResponse.json(
        { error: 'Appeal not found' },
        { status: 404 }
      );
    }

    if (appeal.status !== 'DECIDED') {
      return NextResponse.json(
        { error: 'Additional requests can only be submitted for decided appeals' },
        { status: 400 }
      );
    }

    // Append the additional request to the existing decision
    const currentDecision = appeal.decision || '';
    const additionalRequestText = `\n\nAdditional Request (${new Date().toISOString()}):\n${validatedData.additionalRequest}`;

    const updatedAppeal = await prisma.appeal.update({
      where: { id: appealId },
      data: {
        decision: currentDecision + additionalRequestText,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Additional request submitted successfully',
      appeal: {
        id: updatedAppeal.id,
        decision: updatedAppeal.decision,
        updatedAt: updatedAppeal.updatedAt,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error("[APPEAL_ADDITIONAL_REQUEST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 