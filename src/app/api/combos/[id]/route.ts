import { prisma } from '@/lib/prisma'
import { kebabCase } from 'lodash'
import { NextRequest, NextResponse } from 'next/server'
import { canView, canManage } from '@/lib/apiPermissions'

// GET /api/admin/combos/[id] - Get single combo
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { session, hasAccess } = await canView('Services')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem combo' }, { status: 403 })
        }

        const { id } = await params

        const combo = await prisma.combo.findUnique({
            where: { id },
        })

        if (!combo) {
            return NextResponse.json({ error: 'Combo not found' }, { status: 404 })
        }

        return NextResponse.json(combo)
    } catch (error) {
        console.error('Get combo error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT /api/admin/combos/[id] - Update combo
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { session, hasAccess } = await canManage('Services')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền sửa combo' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { name, duration, price, description, features, icon, sortOrder, isActive, isPopular } = body

        if (!name || !duration || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check if combo exists
        const existing = await prisma.combo.findUnique({
            where: { id },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Combo not found' }, { status: 404 })
        }

        const combo = await prisma.combo.update({
            where: { id },
            data: {
                name,
                slug: name !== existing.name ? kebabCase(name) + '-' + Date.now() : existing.slug,
                duration: parseInt(duration),
                price: parseInt(price),
                description: description || null,
                features: Array.isArray(features) ? features : [features].filter(Boolean),
                icon: icon || null,
                sortOrder: sortOrder ? parseInt(sortOrder) : 0,
                isActive: isActive !== undefined ? isActive : true,
                isPopular: isPopular || false,
            },
        })

        return NextResponse.json(combo)
    } catch (error) {
        console.error('Update combo error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/admin/combos/[id] - Delete combo
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { session, hasAccess } = await canManage('Services')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xóa combo' }, { status: 403 })
        }

        const { id } = await params

        await prisma.combo.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete combo error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
