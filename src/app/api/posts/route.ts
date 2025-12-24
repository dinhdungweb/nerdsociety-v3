import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/posts - Get published posts for public
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // NEWS, EVENT, or null for all
        const featured = searchParams.get('featured') // true or null
        const limit = parseInt(searchParams.get('limit') || '10')
        const page = parseInt(searchParams.get('page') || '1')

        const where: Record<string, unknown> = {
            status: 'PUBLISHED',
        }
        if (type) where.type = type
        if (featured === 'true') where.featured = true

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: [
                    { featured: 'desc' },
                    { publishedAt: 'desc' },
                ],
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    type: true,
                    excerpt: true,
                    thumbnail: true,
                    images: true,
                    publishedAt: true,
                    eventDate: true,
                    eventTime: true,
                    eventLocation: true,
                    featured: true,
                    viewCount: true,
                    author: {
                        select: { name: true },
                    },
                },
            }),
            prisma.post.count({ where }),
        ])

        return NextResponse.json({
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error('Error fetching posts:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
