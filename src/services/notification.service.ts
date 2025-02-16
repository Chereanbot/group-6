import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';
import { webPush } from '@/lib/webPush';

interface NotificationOptions {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  metadata?: any;
  expiresAt?: Date;
}

class NotificationService {
  async create(options: NotificationOptions) {
    try {
      // Get user preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: {
          userId_type: {
            userId: options.userId,
            type: options.type
          }
        },
        include: {
          user: {
            select: {
              email: true,
              phone: true,
              pushSubscription: true
            }
          }
        }
      });

      // Create in-app notification
      const notification = await prisma.notification.create({
        data: {
          userId: options.userId,
          title: options.title,
          message: options.message,
          type: options.type,
          priority: options.priority || 'NORMAL',
          link: options.link,
          metadata: options.metadata,
          expiresAt: options.expiresAt
        }
      });

      // Send notifications based on preferences
      if (preferences) {
        const { user } = preferences;

        // Send email notification
        if (preferences.email && user.email) {
          await sendEmail({
            to: user.email,
            subject: options.title,
            template: 'notification',
            data: {
              title: options.title,
              message: options.message,
              link: options.link,
              type: options.type
            }
          });
        }

        // Send SMS notification
        if (preferences.sms && user.phone) {
          await sendSMS({
            to: user.phone,
            message: `${options.title}: ${options.message}`
          });
        }

        // Send push notification
        if (preferences.push && user.pushSubscription) {
          await webPush.sendNotification(
            JSON.parse(user.pushSubscription),
            JSON.stringify({
              title: options.title,
              body: options.message,
              link: options.link
            })
          );
        }
      }

      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: {
        id: notificationId,
        userId
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        status: 'UNREAD'
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    });
  }

  async delete(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: {
        id: notificationId,
        userId
      },
      data: {
        status: 'DELETED'
      }
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        status: 'UNREAD'
      }
    });
  }

  async getUserNotifications(userId: string, options: {
    status?: NotificationStatus[];
    type?: NotificationType[];
    limit?: number;
    offset?: number;
  } = {}) {
    return prisma.notification.findMany({
      where: {
        userId,
        status: options.status ? { in: options.status } : undefined,
        type: options.type ? { in: options.type } : undefined
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: options.limit,
      skip: options.offset
    });
  }

  async updatePreferences(userId: string, preferences: {
    type: NotificationType;
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    inApp?: boolean;
  }) {
    return prisma.notificationPreference.upsert({
      where: {
        userId_type: {
          userId,
          type: preferences.type
        }
      },
      update: {
        email: preferences.email,
        sms: preferences.sms,
        push: preferences.push,
        inApp: preferences.inApp
      },
      create: {
        userId,
        type: preferences.type,
        email: preferences.email ?? true,
        sms: preferences.sms ?? true,
        push: preferences.push ?? true,
        inApp: preferences.inApp ?? true
      }
    });
  }
}

export const notificationService = new NotificationService(); 