import { EventEmitter } from 'events';
import { prisma } from '../prisma';

class SecurityEventEmitter extends EventEmitter {
  private static instance: SecurityEventEmitter;

  private constructor() {
    super();
    this.setupEventHandlers();
  }

  public static getInstance(): SecurityEventEmitter {
    if (!SecurityEventEmitter.instance) {
      SecurityEventEmitter.instance = new SecurityEventEmitter();
    }
    return SecurityEventEmitter.instance;
  }

  private setupEventHandlers() {
    // Login attempts
    this.on('login_attempt', async (data: { 
      userId?: string, 
      ipAddress: string, 
      success: boolean,
      userAgent?: string
    }) => {
      await this.logSecurityEvent({
        eventType: data.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
        severity: data.success ? 'low' : 'medium',
        description: `Login ${data.success ? 'successful' : 'failed'} from IP ${data.ipAddress}`,
        ipAddress: data.ipAddress,
        userId: data.userId,
        status: data.success ? 'success' : 'failure',
        details: {
          userAgent: data.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      // Check for brute force attempts
      if (!data.success) {
        await this.checkBruteForce(data.ipAddress);
      }
    });

    // Password changes
    this.on('password_change', async (data: { 
      userId: string, 
      ipAddress: string,
      forced: boolean 
    }) => {
      await this.logSecurityEvent({
        eventType: 'PASSWORD_CHANGE',
        severity: 'medium',
        description: `Password changed for user ID ${data.userId}`,
        ipAddress: data.ipAddress,
        userId: data.userId,
        status: 'success',
        details: {
          forced: data.forced,
          timestamp: new Date().toISOString()
        }
      });
    });

    // Permission changes
    this.on('permission_change', async (data: {
      userId: string,
      adminId: string,
      ipAddress: string,
      changes: any
    }) => {
      await this.logSecurityEvent({
        eventType: 'PERMISSION_CHANGE',
        severity: 'high',
        description: `Permissions modified for user ID ${data.userId}`,
        ipAddress: data.ipAddress,
        userId: data.adminId,
        status: 'success',
        details: {
          targetUserId: data.userId,
          changes: data.changes,
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  private async checkBruteForce(ipAddress: string) {
    const recentFailures = await prisma.securityLog.count({
      where: {
        ipAddress,
        eventType: 'LOGIN_FAILURE',
        timestamp: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        }
      }
    });

    if (recentFailures >= 5) {
      await this.blockIP(ipAddress, 'Suspected brute force attack');
      this.emit('security_alert', {
        type: 'BRUTE_FORCE_DETECTED',
        severity: 'high',
        message: `Brute force attack detected from IP ${ipAddress}`,
        details: {
          ipAddress,
          failedAttempts: recentFailures,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  private async blockIP(ipAddress: string, reason: string) {
    await prisma.blockedIP.create({
      data: {
        ipAddress,
        reason,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour block
      }
    });
  }

  private async logSecurityEvent(data: {
    eventType: string;
    severity: string;
    description: string;
    ipAddress: string;
    userId?: string;
    status: string;
    details: any;
  }) {
    await prisma.securityLog.create({
      data: {
        ...data,
        timestamp: new Date()
      }
    });
  }

  public async isIPBlocked(ipAddress: string): Promise<boolean> {
    const blockedIP = await prisma.blockedIP.findFirst({
      where: {
        ipAddress,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    return !!blockedIP;
  }
}

export const securityEvents = SecurityEventEmitter.getInstance(); 