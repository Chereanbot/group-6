import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authorization header format' },
        { status: 401 }
      );
    }

    const authResult = await verifyAuth(token);
    console.log('Auth result:', { isAuthenticated: authResult.isAuthenticated, hasUser: !!authResult.user });

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const field = searchParams.get('field') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;

    console.log('Search params:', { query, field, page, limit, sortBy, sortOrder, status, role });

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause based on search field
    let where: Prisma.UserWhereInput = {};

    if (query) {
      switch (field) {
        case 'name':
          where.fullName = { contains: query, mode: 'insensitive' };
          break;
        case 'email':
          where.email = { contains: query, mode: 'insensitive' };
          break;
        case 'phone':
          where.phone = { contains: query, mode: 'insensitive' };
          break;
        case 'role':
          where.userRole = { equals: query.toUpperCase() };
          break;
        case 'all':
        default:
          where.OR = [
            { fullName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { userRole: { equals: query.toUpperCase() } }
          ];
      }
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add role filter if provided
    if (role) {
      where.userRole = role;
    }

    console.log('Prisma where clause:', where);

    // Get total count for pagination
    const total = await prisma.user.count({ where });
    console.log('Total users found:', total);

    // Get users with pagination and sorting
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        userRole: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    console.log(`Retrieved ${users.length} users`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPreviousPage
        }
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
    
    // Provide more detailed error message based on the error type
    let errorMessage = 'Failed to search users';
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          errorMessage = 'Database constraint violation';
          break;
        case 'P2025':
          errorMessage = 'Record not found';
          break;
        default:
          errorMessage = `Database error: ${error.code}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 