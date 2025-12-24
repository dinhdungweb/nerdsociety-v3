import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

interface AuditLogParams {
    userId: string
    userName: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'CHECK_IN' | 'CHECK_OUT' | 'CONFIRM_PAYMENT' | 'CANCEL' | 'VIEW' | 'EXPORT'
    resource: string
    resourceId?: string
    details?: Record<string, any>
}

/**
 * Log an admin action for audit trail
 */
export async function logAudit(params: AuditLogParams) {
    try {
        const headersList = await headers()
        const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                userName: params.userName,
                action: params.action,
                resource: params.resource,
                resourceId: params.resourceId,
                details: params.details ? JSON.stringify(params.details) : null,
                ipAddress: ipAddress.split(',')[0].trim(),
                userAgent,
            },
        })
    } catch (error) {
        console.error('Error logging audit:', error)
        // Don't throw - audit logging should not break the main operation
    }
}

/**
 * Shorthand for common audit actions
 */
export const audit = {
    create: (userId: string, userName: string, resource: string, resourceId: string, details?: Record<string, any>) =>
        logAudit({ userId, userName, action: 'CREATE', resource, resourceId, details }),

    update: (userId: string, userName: string, resource: string, resourceId: string, details?: Record<string, any>) =>
        logAudit({ userId, userName, action: 'UPDATE', resource, resourceId, details }),

    delete: (userId: string, userName: string, resource: string, resourceId: string, details?: Record<string, any>) =>
        logAudit({ userId, userName, action: 'DELETE', resource, resourceId, details }),

    login: (userId: string, userName: string) =>
        logAudit({ userId, userName, action: 'LOGIN', resource: 'auth' }),

    logout: (userId: string, userName: string) =>
        logAudit({ userId, userName, action: 'LOGOUT', resource: 'auth' }),

    checkIn: (userId: string, userName: string, bookingId: string, details?: Record<string, any>) =>
        logAudit({ userId, userName, action: 'CHECK_IN', resource: 'booking', resourceId: bookingId, details }),

    checkOut: (userId: string, userName: string, bookingId: string, details?: Record<string, any>) =>
        logAudit({ userId, userName, action: 'CHECK_OUT', resource: 'booking', resourceId: bookingId, details }),

    confirmPayment: (userId: string, userName: string, bookingId: string, details?: Record<string, any>) =>
        logAudit({ userId, userName, action: 'CONFIRM_PAYMENT', resource: 'booking', resourceId: bookingId, details }),

    cancel: (userId: string, userName: string, resource: string, resourceId: string, details?: Record<string, any>) =>
        logAudit({ userId, userName, action: 'CANCEL', resource, resourceId, details }),
}
