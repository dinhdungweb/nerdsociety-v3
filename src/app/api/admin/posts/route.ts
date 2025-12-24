import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { audit } from '@/lib/audit'
import { canManage, canView } from '@/lib/apiPermissions'

// GET /api/admin/posts - Get all posts with filters
export async function GET(request: NextRequest) {
    try {
        const { session, hasAccess } = await canView('Posts')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem bài viết' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // NEWS, EVENT, or null for all
        const status = searchParams.get('status') // DRAFT, PUBLISHED, ARCHIVED
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const where: Record<string, unknown> = {}
        if (type) where.type = type
        if (status) where.status = status

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    author: {
                        select: { id: true, name: true, email: true },
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

// POST /api/admin/posts - Create a new post
export async function POST(request: NextRequest) {
    try {
        const { session, hasAccess } = await canManage('Posts')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền tạo bài viết' }, { status: 403 })
        }

        // Get the user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 403 })
        }

        const body = await request.json()
        const {
            title,
            slug,
            type = 'NEWS',
            excerpt,
            content,
            thumbnail,
            images = [],
            status = 'DRAFT',
            eventDate,
            eventTime,
            eventLocation,
            featured = false,
        } = body

        // Validate required fields
        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: 'Title, slug, and content are required' },
                { status: 400 }
            )
        }

        // Check if slug already exists
        const existingPost = await prisma.post.findUnique({
            where: { slug },
        })

        if (existingPost) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            )
        }

        const post = await prisma.post.create({
            data: {
                title,
                slug,
                type,
                excerpt,
                content,
                thumbnail,
                images,
                authorId: user.id,
                status,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                eventDate: eventDate ? new Date(eventDate) : null,
                eventTime,
                eventLocation,
                featured,
            },
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        // Audit logging
        await audit.create(
            user.id,
            user.name || user.email || 'Admin',
            'post',
            post.id,
            { title: post.title, type: post.type, status: post.status }
        )

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error('Error creating post:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
