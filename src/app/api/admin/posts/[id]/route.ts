import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { audit } from '@/lib/audit'
import { canView, canManage } from '@/lib/apiPermissions'

// GET /api/admin/posts/[id] - Get a single post (requires canViewPosts permission)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { session, hasAccess } = await canView('Posts')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem bài viết' }, { status: 403 })
        }

        const { id } = await params

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, name: true, email: true },
                },
            },
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error fetching post:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT /api/admin/posts/[id] - Update a post (requires canManagePosts permission)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { session, hasAccess } = await canManage('Posts')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền sửa bài viết' }, { status: 403 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        const { id } = await params
        const body = await request.json()

        const existingPost = await prisma.post.findUnique({
            where: { id },
        })

        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const {
            title,
            slug,
            type,
            excerpt,
            content,
            thumbnail,
            images,
            status,
            eventDate,
            eventTime,
            eventLocation,
            featured,
        } = body

        // Check if new slug conflicts with another post
        if (slug && slug !== existingPost.slug) {
            const slugExists = await prisma.post.findUnique({
                where: { slug },
            })
            if (slugExists) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                )
            }
        }

        // Determine publishedAt
        let publishedAt = existingPost.publishedAt
        if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
            publishedAt = new Date()
        } else if (status !== 'PUBLISHED') {
            publishedAt = null
        }

        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                slug,
                type,
                excerpt,
                content,
                thumbnail,
                images,
                status,
                publishedAt,
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
        await audit.update(
            user?.id || session.user.id || 'unknown',
            user?.name || session.user.name || session.user.email || 'Admin',
            'post',
            post.id,
            { title: post.title, type: post.type, status: post.status }
        )

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error updating post:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE /api/admin/posts/[id] - Delete a post (requires canManagePosts permission)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { session, hasAccess } = await canManage('Posts')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xóa bài viết' }, { status: 403 })
        }

        const { id } = await params

        const existingPost = await prisma.post.findUnique({
            where: { id },
        })

        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        await prisma.post.delete({
            where: { id },
        })

        // Audit logging
        await audit.delete(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Admin',
            'post',
            id,
            { title: existingPost.title, type: existingPost.type }
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting post:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
