import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update lawyer status
      const lawyer = await tx.lawyer.update({
        where: { id: params.id },
        data: {
          user: {
            update: {
              status: 'SUSPENDED'
            }
          }
        }
      });

      // Create suspension record
      await tx.suspension.create({
        data: {
          lawyerId: params.id,
          reason: data.reason,
          duration: data.duration,
          notes: data.notes,
          suspendedBy: session.user.id
        }
      });

      // Reassign active cases
      await tx.case.updateMany({
        where: {
          lawyerId: params.id,
          status: 'ACTIVE'
        },
        data: {
          status: 'PENDING_REASSIGNMENT'
        }
      });

      return lawyer;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error suspending lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to suspend lawyer' },
      { status: 500 }
    );
  }
} 