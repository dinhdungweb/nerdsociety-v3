import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { canManage } from '@/lib/apiPermissions'

// GET /api/admin/gallery - Get gallery images
export async function GET() {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: 'galleryImages' },
        })

        if (setting) {
            return NextResponse.json({ images: JSON.parse(setting.value) })
        }

        return NextResponse.json({ images: [] })
    } catch (error) {
        console.error('Error fetching gallery:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST /api/admin/gallery - Save gallery images (requires canManageGallery permission)
export async function POST(request: NextRequest) {
    try {
        const { session, hasAccess } = await canManage('Gallery')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền quản lý Gallery' }, { status: 403 })
        }

        const body = await request.json()
        const { images } = body

        // Upsert gallery setting
        await prisma.setting.upsert({
            where: { key: 'galleryImages' },
            update: { value: JSON.stringify(images) },
            create: { key: 'galleryImages', value: JSON.stringify(images) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving gallery:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
