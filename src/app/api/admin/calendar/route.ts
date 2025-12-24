import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'

// GET - Lấy bookings theo date range cho Calendar view (requires canViewBookings)
export async function GET(request: Request) {
    try {
        const { hasAccess } = await canView('Bookings')
        if (!hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem lịch' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const roomId = searchParams.get('roomId')
        const locationId = searchParams.get('locationId')

        // Build where clause
        const where: Record<string, unknown> = {}

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            }
        } else if (startDate) {
            where.date = {
                gte: new Date(startDate),
            }
        }

        if (roomId) {
            where.roomId = roomId
        }

        if (locationId) {
            where.locationId = locationId
        }

        // Exclude cancelled bookings
        where.status = {
            notIn: ['CANCELLED'],
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
        })

        // Transform for calendar view
        const events = bookings.map(booking => ({
            id: booking.id,
            title: `${booking.customerName} - ${booking.room.name}`,
            start: `${booking.date.toISOString().split('T')[0]}T${booking.startTime}`,
            end: `${booking.date.toISOString().split('T')[0]}T${booking.endTime}`,
            resourceId: booking.roomId,
            extendedProps: {
                bookingCode: booking.bookingCode,
                customerName: booking.customerName,
                customerPhone: booking.customerPhone,
                roomName: booking.room.name,
                roomType: booking.room.type,
                status: booking.status,
                guests: booking.guests,
                estimatedAmount: booking.estimatedAmount,
                depositStatus: booking.depositStatus,
            },
            backgroundColor: getStatusColor(booking.status),
            borderColor: getStatusColor(booking.status),
        }))

        // Get rooms for resources
        const rooms = await prisma.room.findMany({
            where: locationId ? { locationId } : { isActive: true },
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                type: true,
            },
        })

        const resources = rooms.map(room => ({
            id: room.id,
            title: room.name,
            type: room.type,
        }))

        return NextResponse.json({ events, resources })
    } catch (error) {
        console.error('Error fetching calendar data:', error)
        return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
    }
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: '#f59e0b',      // amber
        CONFIRMED: '#3b82f6',    // blue
        IN_PROGRESS: '#10b981',  // emerald
        COMPLETED: '#6b7280',    // gray
        CANCELLED: '#ef4444',    // red
        NO_SHOW: '#9ca3af',      // gray-400
    }
    return colors[status] || '#6b7280'
}
