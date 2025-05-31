import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, params) {
  // Auth & access checks (reuse from other endpoints)
  // Fetch all activities for the case
  const { id } = await params;
  const activities = await prisma.caseActivity.findMany({
    where: { caseId: id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { id: true, fullName: true, email: true } } }
  });
  return NextResponse.json({ success: true, data: activities });
}

export async function POST(req, params) {
  const { id } = await params;
  const { title, description, type } = await req.json();

  // Extract token from headers or cookies
  const headersList = await headers();
  const token = headersList.get('authorization')?.split(' ')[1] ||
    req.headers.get('cookie')?.split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const authResult = await verifyAuth(token);
  if (!authResult.isAuthenticated || !authResult.user || !authResult.user.id) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = authResult.user.id;

  const activity = await prisma.caseActivity.create({
    data: {
      caseId: id,
      title,
      description,
      type,
      userId,
    },
  });
  return NextResponse.json({ success: true, data: activity });
} 