import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UserRoleEnum } from '@/types/security.types';
import { translateToAmharic } from '@/utils/translations';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;
        
        console.log('Auth token:', token ? 'Present' : 'Missing');
    
        if (!token) {
          return NextResponse.json(
            { success: false, message: translateToAmharic("Unauthorized") },
            { status: 401 }
          );
        }
    
        const { isAuthenticated, user } = await verifyAuth(token);
        console.log('Auth status:', { isAuthenticated, userRole: user?.userRole });
    
        if (!isAuthenticated || !user || user.userRole !== UserRoleEnum.CLIENT) {
          return NextResponse.json(
            { success: false, message: translateToAmharic("Unauthorized") },
            { status: 401 }
          );
        }

        // Fetch all cases for the client
        const cases = await prisma.case.findMany({
          where: {
            clientId: user.id,
          },
          orderBy: {
            createdAt: 'desc',
          }
        });

        console.log('Found cases:', cases.length);

        // Map the cases to the expected format
        const formattedCases = cases.map(caseItem => ({
          id: caseItem.id,
          title: caseItem.title,
          category: caseItem.category,
          priority: caseItem.priority,
          status: caseItem.status,
          description: caseItem.description,
          createdAt: caseItem.createdAt
        }));

        return NextResponse.json({ 
          success: true,
          cases: formattedCases 
        });
    } catch (error) {
        console.error('Error in GET /api/client/cases/raw:', error);
        return NextResponse.json(
          { success: false, error: 'Internal server error' },
          { status: 500 }
        );
    }
} 