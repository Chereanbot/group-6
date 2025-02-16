import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
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
        updatedAt: true,
        password: true,
        isAdmin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      userRole: user.userRole,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      password: user.password
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Store the original password before hashing
    const plainPassword = body.password;
    // Hash the password for authentication
    const hashedPassword = await hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        plainPassword: plainPassword, // Store original password
        fullName: body.fullName,
        username: body.username,
        userRole: body.role,
        emailVerified: false,
        phoneVerified: false,
        isAdmin: body.role === 'SUPER_ADMIN' || body.role === 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        username: true,
        userRole: true,
        emailVerified: true,
        phoneVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create user',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If password is being updated, hash it and store plain version
    if (updateData.password) {
      updateData.plainPassword = updateData.password;
      updateData.password = await hash(updateData.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        username: true,
        userRole: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update user',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Add endpoint for resetting password
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    const authResult = await verifyAuth(token || '');

    if (!authResult.isAuthenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    if (!authResult.user.isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        plainPassword: newPassword,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to reset password',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 