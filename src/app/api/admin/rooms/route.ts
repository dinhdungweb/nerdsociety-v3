import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { canView, canManage } from '@/lib/apiPermissions'

// GET - Lấy danh sách phòng
export async function GET() {
    try {
        const { session, hasAccess } = await canView('Rooms')

        // Allow public access to rooms list for booking form
        // API still works without auth for frontend display

        const rooms = await prisma.room.findMany({
            include: {
                location: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' },
            ],
        })
        return NextResponse.json(rooms)
    } catch (error) {
        console.error('Error fetching rooms:', error)
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
    }
}

// POST - Tạo phòng mới (requires canManageRooms permission)
export async function POST(request: Request) {
    try {
        const { session, hasAccess, role } = await canManage('Rooms')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền thêm phòng' }, { status: 403 })
        }

        const body = await request.json()
        const { name, type, description, capacity, amenities, image, locationId } = body

        if (!name || !type || !locationId) {
            return NextResponse.json(
                { error: 'Missing required fields: name, type, locationId' },
                { status: 400 }
            )
        }

        const room = await prisma.room.create({
            data: {
                name,
                type,
                description,
                capacity: parseInt(capacity) || 1,
                amenities: amenities || [],
                image,
                locationId,
            },
            include: {
                location: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        // Audit logging
        await audit.create(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Admin',
            'room',
            room.id,
            { name: room.name, type: room.type, location: room.location?.name }
        )

        return NextResponse.json(room, { status: 201 })
    } catch (error) {
        console.error('Error creating room:', error)
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
    }
}
