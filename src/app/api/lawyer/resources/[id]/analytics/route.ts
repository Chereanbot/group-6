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

    const { action, metadata } = await req.json();

    const analytics = await prisma.resourceAnalytics.create({
      data: {
        resourceId: params.id,
        userId: session.user.id,
        action,
        metadata
      }
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[RESOURCE_ANALYTICS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const analytics = await prisma.resourceAnalytics.groupBy({
      by: ['action'],
      where: {
        resourceId: params.id
      },
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[RESOURCE_ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 