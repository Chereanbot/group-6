import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sharedWithId, permissions, expiresAt } = await req.json();

    // Verify resource ownership
    const resource = await prisma.legalResource.findUnique({
      where: {
        id: params.id,
        lawyerId: session.user.id
      }
    });

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // Create share record
    const share = await prisma.resourceShare.create({
      data: {
        resourceId: params.id,
        sharedById: session.user.id,
        sharedWithId,
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        sharedWith: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    // Track analytics
    await prisma.resourceAnalytics.create({
      data: {
        resourceId: params.id,
        userId: session.user.id,
        action: 'SHARE',
        metadata: { sharedWithId, permissions }
      }
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error("[RESOURCE_SHARE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 