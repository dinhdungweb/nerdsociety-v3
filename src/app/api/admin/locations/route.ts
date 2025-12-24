import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { audit } from '@/lib/audit'
import { canView, canManage } from '@/lib/apiPermissions'

// GET - Lấy danh sách locations
export async function GET() {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(locations)
    } catch (error) {
        console.error('Error fetching locations:', error)
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
    }
}

// POST - Tạo location mới (requires canManageLocations permission)
export async function POST(req: Request) {
    try {
        const { session, hasAccess } = await canManage('Locations')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền thêm cơ sở' }, { status: 403 })
        }

        const body = await req.json()
        const { name, address, phone, mapUrl, image, isActive } = body

        if (!name || !address || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const location = await prisma.location.create({
            data: {
                name,
                address,
                phone,
                mapUrl,
                image,
                isActive: isActive !== undefined ? isActive : true,
            },
        })

        // Audit logging
        await audit.create(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Admin',
            'location',
            location.id,
            { name: location.name, address: location.address }
        )

        return NextResponse.json(location)
    } catch (error) {
        console.error('Create location error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
