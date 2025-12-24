import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { audit } from '@/lib/audit'
import { canManage } from '@/lib/apiPermissions'

// GET - Lấy thông tin 1 location
export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const location = await prisma.location.findUnique({
            where: { id: params.id },
        })

        if (!location) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 })
        }

        return NextResponse.json(location)
    } catch (error) {
        console.error('Error fetching location:', error)
        return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 })
    }
}

// PUT - Cập nhật location (requires canManageLocations permission)
export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const { session, hasAccess } = await canManage('Locations')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền sửa cơ sở' }, { status: 403 })
        }

        const body = await req.json()
        const { name, address, phone, mapUrl, image, isActive } = body

        const location = await prisma.location.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(address && { address }),
                ...(phone && { phone }),
                ...(mapUrl !== undefined && { mapUrl }),
                ...(image !== undefined && { image }),
                ...(isActive !== undefined && { isActive }),
            },
        })

        // Audit logging
        await audit.update(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Admin',
            'location',
            location.id,
            { name: location.name, address: location.address }
        )

        return NextResponse.json(location)
    } catch (error) {
        console.error('Update location error:', error)
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
    }
}

// DELETE - Xóa location (requires canManageLocations permission)
export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const { session, hasAccess } = await canManage('Locations')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xóa cơ sở' }, { status: 403 })
        }

        // Check if location has rooms
        const roomCount = await prisma.room.count({
            where: { locationId: params.id }
        })

        if (roomCount > 0) {
            return NextResponse.json(
                { error: 'Không thể xóa cơ sở có phòng. Vui lòng xóa hoặc chuyển phòng trước.' },
                { status: 400 }
            )
        }

        // Get location info before deletion
        const locationToDelete = await prisma.location.findUnique({
            where: { id: params.id },
            select: { name: true, address: true }
        })

        await prisma.location.delete({
            where: { id: params.id },
        })

        // Audit logging
        await audit.delete(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Admin',
            'location',
            params.id,
            { name: locationToDelete?.name, address: locationToDelete?.address }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete location error:', error)
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
    }
}
