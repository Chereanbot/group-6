import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import based on your project structure

export async function GET(request: Request) {
  try {
    const lawyers = await prisma.lawyer.findMany(); // Adjust the model name as necessary

    return NextResponse.json({ success: true, data: lawyers });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch lawyers' }, { status: 500 });
  }
} 