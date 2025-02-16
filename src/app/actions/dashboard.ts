'use server';

import { prisma } from '@/lib/prisma';
import { DashboardStats, AdminActivity } from '@/types/admin.types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        users: { total: 0, active: 0, new: 0, lawyers: 0, coordinators: 0 },
        cases: { total: 0, active: 0, completed: 0, pending: 0 },
        services: { total: 0, pending: 0, active: 0, completed: 0, revenue: 0 },
        performance: { successRate: 0, avgResolutionTime: 0, clientSatisfaction: 0 }
      };
    }

    const [
      users,
      cases,
      services,
      lawyers,
      coordinators,
      completedCases,
      activeServices,
      payments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.case.count(),
      prisma.serviceRequest.count(),
      prisma.user.count({ where: { role: 'LAWYER' } }),
      prisma.coordinator.count(),
      prisma.case.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceRequest.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true }
      })
    ]);

    const revenue = payments.reduce((acc, payment) => acc + (payment.amount || 0), 0);

    return {
      users: {
        total: users,
        active: users,
        new: 0,
        lawyers,
        coordinators
      },
      cases: {
        total: cases,
        active: cases - completedCases,
        completed: completedCases,
        pending: cases - completedCases - activeServices
      },
      services: {
        total: services,
        active: activeServices,
        pending: services - activeServices,
        completed: services - activeServices,
        revenue
      },
      performance: {
        successRate: cases > 0 ? (completedCases / cases) * 100 : 0,
        avgResolutionTime: 0,
        clientSatisfaction: 0
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

export async function getRecentActivity(): Promise<AdminActivity[]> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return []; // Return empty array instead of throwing error
    }

    const activities = await prisma.activity.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    return activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      details: activity.details,
      timestamp: activity.createdAt,
      user: {
        id: activity.user.id,
        name: activity.user.fullName,
        role: activity.user.role
      }
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return []; // Return empty array on error
  }
} 