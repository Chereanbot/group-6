import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get coordinator info
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: session.user.id },
      include: { office: true }
    });

    if (!coordinator) {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 });
    }

    // Get templates for this coordinator and office, plus default templates
    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { officeId: coordinator.officeId },
          { isDefault: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Template fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get coordinator info
    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: session.user.id },
      include: { office: true }
    });

    if (!coordinator) {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 });
    }

    const data = await req.json();
    const template = await prisma.template.create({
      data: {
        ...data,
        createdBy: session.user.id,
        officeId: coordinator.officeId
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
} 