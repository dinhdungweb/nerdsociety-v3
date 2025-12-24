'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'

// GET: Lấy chi tiết cuộc trò chuyện + tin nhắn
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const before = url.searchParams.get('before')

        // 1. Get conversation details
        const conversation = await prisma.chatConversation.findUnique({
            where: { id },
        })

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        // 2. Get messages with pagination
        const messages = await prisma.chatMessage.findMany({
            where: {
                conversationId: id,
                ...(before ? { createdAt: { lt: new Date(before) } } : {})
            },
            take: before ? limit : -limit,
            orderBy: { createdAt: 'asc' },
            // Removed include as attachments are string[]
        })

        // Combine
        return NextResponse.json({
            ...conversation,
            messages
        })
    } catch (error) {
        console.error('Error fetching conversation:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH: Cập nhật trạng thái, assign nhân viên
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { session, hasAccess } = await canView('Chat')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền quản lý chat' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { status, assignedToId } = body

        const updateData: any = {}

        if (status) {
            updateData.status = status
            if (status === 'CLOSED' || status === 'RESOLVED') {
                updateData.closedAt = new Date()
            }
        }

        if (assignedToId !== undefined) {
            updateData.assignedToId = assignedToId
            if (assignedToId && status !== 'CLOSED') {
                updateData.status = 'ASSIGNED'
            }
        }

        const conversation = await prisma.chatConversation.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(conversation)
    } catch (error) {
        console.error('Error updating conversation:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
