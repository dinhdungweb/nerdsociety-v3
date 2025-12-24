import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'

/**
 * GET /api/admin/audit-log
 * Get audit log entries with filtering and pagination (requires canViewAuditLog permission)
 */
export async function GET(request: NextRequest) {
    try {
        const { session, hasAccess } = await canView('AuditLog')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem audit log' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const action = searchParams.get('action')
        const resource = searchParams.get('resource')
        const userId = searchParams.get('userId')
        const search = searchParams.get('search')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const where: any = {}

        if (action) where.action = action
        if (resource) where.resource = resource
        if (userId) where.userId = userId
        if (search) {
            where.OR = [
                { userName: { contains: search, mode: 'insensitive' } },
                { resourceId: { contains: search, mode: 'insensitive' } },
                { details: { contains: search, mode: 'insensitive' } },
            ]
        }
        if (startDate) {
            where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
        }
        if (endDate) {
            where.createdAt = { ...where.createdAt, lte: new Date(endDate + 'T23:59:59') }
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ])

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
