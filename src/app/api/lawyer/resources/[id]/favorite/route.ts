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

    const resource = await prisma.legalResource.findUnique({
      where: {
        id: params.id,
        lawyerId: session.user.id
      }
    });

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    const updatedResource = await prisma.legalResource.update({
      where: { id: params.id },
      data: {
        isFavorite: !resource.isFavorite
      }
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("[RESOURCE_FAVORITE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 