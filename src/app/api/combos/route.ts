import { prisma } from '@/lib/prisma'
import { kebabCase } from 'lodash'
import { NextResponse } from 'next/server'
import { canManage } from '@/lib/apiPermissions'

export async function POST(req: Request) {
    try {
        const { session, hasAccess } = await canManage('Services')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền tạo combo' }, { status: 403 })
        }

        const body = await req.json()
        const { name, duration, price, description, features, sortOrder, isActive, isPopular } = body

        if (!name || !duration || !price || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const combo = await prisma.combo.create({
            data: {
                name,
                slug: kebabCase(name) + '-' + Date.now(),
                duration: parseInt(duration),
                price: parseInt(price),
                description,
                features: Array.isArray(features) ? features : [features],
                sortOrder: sortOrder ? parseInt(sortOrder) : 0,
                isActive: isActive !== undefined ? isActive : true,
                isPopular: isPopular || false,
            },
        })

        return NextResponse.json(combo)
    } catch (error) {
        console.error('Create combo error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
