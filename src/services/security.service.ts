'use server'

import { SecurityLevel, SettingCategory, SecurityRequirement, AuditLog } from '@/types/security.types';
import { UserRoleEnum, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export enum AuditAction {
LOGIN_SUCCESS = 'LOGIN_SUCCESS',
LOGIN_FAILED = 'LOGIN_FAILED',
PASSWORD_RESET = 'PASSWORD_RESET',
ENABLE_2FA = 'ENABLE_2FA'
}

export interface AuditLogEntry {
userId?: string;
action: AuditAction;
details?: string;
ipAddress?: string;
userAgent?: string;
}

export const settingsSecurityConfig: Record<SettingCategory, SecurityRequirement> = {
[SettingCategory.GENERAL]: {
    level: SecurityLevel.LOW,
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    twoFactorRequired: false,
    ipRestricted: false
},
[SettingCategory.SITE]: {
    level: SecurityLevel.LOW,
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    twoFactorRequired: false,
    ipRestricted: false
},
[SettingCategory.EMAIL]: {
    level: SecurityLevel.MEDIUM,
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    twoFactorRequired: false,
    ipRestricted: false
},
[SettingCategory.NOTIFICATIONS]: {
    level: SecurityLevel.LOW,
    roles: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],
    twoFactorRequired: false,
    ipRestricted: false
},
[SettingCategory.SECURITY]: {
    level: SecurityLevel.CRITICAL,
    roles: [UserRoleEnum.SUPER_ADMIN],
    twoFactorRequired: true,
    ipRestricted: true
},
[SettingCategory.DATABASE]: {
    level: SecurityLevel.CRITICAL,
    roles: [UserRoleEnum.SUPER_ADMIN],
    twoFactorRequired: true,
    ipRestricted: true
},
[SettingCategory.API]: {
    level: SecurityLevel.HIGH,
    roles: [UserRoleEnum.SUPER_ADMIN],
    twoFactorRequired: true,
    ipRestricted: true
},
[SettingCategory.TEMPLATES]: {
    level: SecurityLevel.MEDIUM,
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    twoFactorRequired: false,
    ipRestricted: false
},
[SettingCategory.APPEARANCE]: {
    level: SecurityLevel.LOW,
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    twoFactorRequired: false,
    ipRestricted: false
},
[SettingCategory.LOCALIZATION]: {
    level: SecurityLevel.LOW,
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN],
    twoFactorRequired: false,
    ipRestricted: false
},
[SettingCategory.BACKUP]: {
    level: SecurityLevel.HIGH,
    roles: [UserRoleEnum.SUPER_ADMIN],
    twoFactorRequired: true,
    ipRestricted: true
}
};

export class SecurityService {
static async checkAccess(
    category: SettingCategory,
    userRole: UserRoleEnum,
    isAdmin: boolean,
    hasTwoFactor: boolean = false
): Promise<boolean> {
    // Super admin always has access
    if (userRole === UserRoleEnum.SUPER_ADMIN && isAdmin) {
        return true;
    }

    const config = settingsSecurityConfig[category];
    if (!config) return false;

    // Check if user's role is allowed
    if (!config.roles.includes(userRole) || !isAdmin) {
    return false;
    }

    // Check 2FA requirement
    if (config.twoFactorRequired && !hasTwoFactor) {
    return false;
    }

    return true;
}

static async logSettingChange(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    // Implement audit logging
    console.log('Audit log:', data);
}

static async getActiveSessions() {
    return await prisma.session.findMany({
        where: {
            expires: {
                gte: new Date()
            }
        },
        include: {
            user: {
                select: {
                    email: true,
                    userRole: true
                }
            }
        }
    });
}

static async terminateSession(sessionId: string) {
    return await prisma.session.delete({
        where: { id: sessionId }
    });
}

static async getSecurityMetrics(timeframe: string) {
    const since = new Date();
    switch (timeframe) {
        case '7d':
            since.setDate(since.getDate() - 7);
            break;
        case '30d':
            since.setDate(since.getDate() - 30);
            break;
        default:
            since.setHours(since.getHours() - 24);
    }

    return await prisma.$transaction([
        prisma.auditLog.count({
            where: {
                action: 'LOGIN_FAILED',
                timestamp: { gte: since }
            }
        }),
        prisma.auditLog.count({
            where: {
                action: 'LOGIN_SUCCESS',
                timestamp: { gte: since }
            }
        })
    ]);
}

static async logAudit(entry: AuditLogEntry) {
try {
    await prisma.auditLog.create({
    data: {
        userId: entry.userId,
        action: entry.action,
        details: entry.details,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: new Date()
    }
    });
} catch (error) {
    console.error('Failed to create audit log:', error);
}
}

async login({ email, password }: { email: string; password: string }) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: true
            }
        });

        if (!user) {
            return {
                success: false,
                error: 'Invalid credentials'
            };
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
            return {
                success: false,
                error: 'Invalid credentials'
            };
        }

        // Create payload object for JWT
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role?.name || null
        };

        const token = sign(
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        return {
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role?.name
                }
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'An error occurred during login'
        };
    }
}
} 