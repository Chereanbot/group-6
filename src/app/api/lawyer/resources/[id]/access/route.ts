import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedResource = await prisma.legalResource.update({
      where: {
        id: params.id,
        lawyerId: session.user.id
      },
      data: {
        lastAccessed: new Date()
      }
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("[RESOURCE_ACCESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 