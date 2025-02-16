import { prisma } from '@/lib/prisma';
import { DashboardStats, AdminActivity } from '@/types/admin.types';

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
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

    const revenue = payments.reduce((acc, payment) => acc + payment.amount, 0);

    return {
      users: {
        total: users,
        active: users, // Add active user logic
        new: 0, // Add new users logic
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
        successRate: (completedCases / cases) * 100 || 0,
        avgResolutionTime: 0, // Add resolution time logic
        clientSatisfaction: 0 // Add satisfaction logic
      }
    };
  }

  async getRecentActivity(limit = 10): Promise<AdminActivity[]> {
    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
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
  }
} 