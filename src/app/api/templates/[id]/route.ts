import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: session.user.id }
    });

    if (!coordinator) {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 });
    }

    const data = await req.json();
    const template = await prisma.template.update({
      where: {
        id: params.id,
        OR: [
          { createdBy: session.user.id },
          { officeId: coordinator.officeId },
          { isDefault: true }
        ]
      },
      data
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coordinator = await prisma.coordinator.findUnique({
      where: { userId: session.user.id }
    });

    if (!coordinator) {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 });
    }

    // Check if template exists and belongs to coordinator
    const template = await prisma.template.findFirst({
      where: {
        id: params.id,
        AND: [
          { createdBy: session.user.id },
          { officeId: coordinator.officeId },
          { isDefault: false } // Prevent deletion of default templates
        ]
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found or cannot be deleted' }, { status: 404 });
    }

    await prisma.template.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Template deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
} 