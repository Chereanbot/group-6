import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const {
      title,
      category,
      description,
      url,
      tags,
      notes,
      credentials,
      attachments
    } = data;

    const resource = await prisma.legalResource.create({
      data: {
        title,
        category,
        description,
        url,
        tags,
        notes,
        credentials: credentials ? {
          create: credentials
        } : undefined,
        attachments: attachments ? {
          create: attachments
        } : undefined,
        lawyer: {
          connect: {
            id: session.user.id
          }
        }
      }
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("[RESOURCES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");

    const resources = await prisma.legalResource.findMany({
      where: {
        lawyerId: session.user.id,
        ...(category && category !== "All Resources" ? { category } : {}),
        ...(query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } }
          ]
        } : {})
      },
      include: {
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("[RESOURCES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 