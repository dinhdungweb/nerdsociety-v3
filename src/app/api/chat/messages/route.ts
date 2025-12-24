'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { triggerChatEvent, CHAT_CHANNELS, CHAT_EVENTS } from '@/lib/pusher-server'
import { canView } from '@/lib/apiPermissions'

// POST: Gửi tin nhắn mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { conversationId, content, senderType, senderId, senderName, guestSessionId, attachments } = body

        if (!conversationId || (!content && (!attachments || attachments.length === 0))) {
            return NextResponse.json({ error: 'conversationId and content/attachments are required' }, { status: 400 })
        }

        // Kiểm tra conversation tồn tại
        const conversation = await prisma.chatConversation.findUnique({
            where: { id: conversationId },
        })

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        // Xác thực quyền gửi tin
        if (senderType === 'STAFF') {
            const { session, hasAccess } = await canView('Chat')
            if (!session || !hasAccess) {
                return NextResponse.json({ error: 'Không có quyền trả lời chat' }, { status: 401 })
            }
        } else if (senderType === 'GUEST') {
            // Kiểm tra guestSessionId khớp với conversation
            if (conversation.guestSessionId && conversation.guestSessionId !== guestSessionId) {
                return NextResponse.json({ error: 'Session mismatch' }, { status: 403 })
            }
        }

        // Tạo tin nhắn
        const message = await prisma.chatMessage.create({
            data: {
                conversationId,
                content: content || '',
                senderType: senderType || 'GUEST',
                senderId,
                senderName,
                attachments: attachments || [],
            },
        })

        // Cập nhật lastMessageAt và unreadCount
        await prisma.chatConversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                unreadCount: senderType === 'GUEST'
                    ? { increment: 1 }
                    : 0, // Reset khi staff trả lời
            },
        })

        // Trigger real-time event
        await triggerChatEvent(
            CHAT_CHANNELS.conversation(conversationId),
            CHAT_EVENTS.NEW_MESSAGE,
            message
        )

        // Notify admin if guest sent message
        if (senderType === 'GUEST') {
            await triggerChatEvent(
                CHAT_CHANNELS.adminNotifications,
                CHAT_EVENTS.NEW_MESSAGE,
                { conversationId, message }
            )
        }

        return NextResponse.json(message, { status: 201 })
    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET: Lấy tin nhắn của conversation (có thể phân trang)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const conversationId = searchParams.get('conversationId')
        const cursor = searchParams.get('cursor')
        const limit = parseInt(searchParams.get('limit') || '50')

        if (!conversationId) {
            return NextResponse.json({ error: 'conversationId is required' }, { status: 400 })
        }

        const messages = await prisma.chatMessage.findMany({
            where: { conversationId },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json(messages)
    } catch (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
