import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'

// GET - Fetch notifications for admin/staff (requires dashboard access)
export async function GET(req: Request) {
    try {
        const { session, hasAccess } = await canView('Dashboard')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem thông báo' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '20')
        const unreadOnly = searchParams.get('unread') === 'true'

        const notifications = await prisma.notification.findMany({
            where: unreadOnly ? { isRead: false } : {},
            orderBy: { createdAt: 'desc' },
            take: limit,
        })

        const unreadCount = await prisma.notification.count({
            where: { isRead: false },
        })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}

// POST - Create a notification (requires dashboard access)
export async function POST(req: Request) {
    try {
        const { session, hasAccess } = await canView('Dashboard')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền tạo thông báo' }, { status: 403 })
        }

        const { type, title, message, link, bookingId } = await req.json()

        const notification = await prisma.notification.create({
            data: {
                type,
                title,
                message,
                link,
                bookingId,
            },
        })

        return NextResponse.json(notification)
    } catch (error) {
        console.error('Error creating notification:', error)
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }
}

// PATCH - Mark notifications as read (requires dashboard access)
export async function PATCH(req: Request) {
    try {
        const { session, hasAccess } = await canView('Dashboard')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền cập nhật thông báo' }, { status: 403 })
        }

        const { ids, markAll } = await req.json()

        if (markAll) {
            await prisma.notification.updateMany({
                where: { isRead: false },
                data: { isRead: true },
            })
        } else if (ids && ids.length > 0) {
            await prisma.notification.updateMany({
                where: { id: { in: ids } },
                data: { isRead: true },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error marking notifications:', error)
        return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }
}
