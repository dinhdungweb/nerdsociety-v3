'use server'

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'
import { triggerChatEvent, CHAT_CHANNELS, CHAT_EVENTS } from '@/lib/pusher-server'

// GET: Lấy danh sách cuộc trò chuyện (Admin/Staff)
export async function GET(request: NextRequest) {
    try {
        const { session, hasAccess } = await canView('Chat')

        // Chỉ Staff/Admin có quyền mới xem được danh sách chat
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem chat' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const assignedToId = searchParams.get('assignedToId')

        const conversations = await prisma.chatConversation.findMany({
            where: {
                ...(status && { status: status as any }),
                ...(assignedToId && { assignedToId }),
            },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { lastMessageAt: 'desc' },
        })

        return NextResponse.json(conversations)
    } catch (error) {
        console.error('Error fetching conversations:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: Tạo cuộc trò chuyện mới (Khách bắt đầu chat)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { guestName, guestEmail, guestPhone, guestSessionId, userId, source, subject, initialMessage } = body

        if (!guestName && !userId) {
            return NextResponse.json({ error: 'Guest name or userId is required' }, { status: 400 })
        }

        if (!initialMessage) {
            return NextResponse.json({ error: 'Initial message is required' }, { status: 400 })
        }

        // Tạo conversation kèm tin nhắn đầu tiên
        const conversation = await prisma.chatConversation.create({
            data: {
                guestName,
                guestEmail,
                guestPhone,
                guestSessionId,
                userId,
                source: source || 'homepage',
                subject,
                lastMessageAt: new Date(),
                unreadCount: 1,
                messages: {
                    create: {
                        content: initialMessage,
                        senderType: userId ? 'GUEST' : 'GUEST',
                        senderName: guestName,
                    },
                },
            },
            include: {
                messages: true,
            },
        })

        // Trigger Pusher event để admin dashboard nhận realtime notification
        triggerChatEvent(CHAT_CHANNELS.adminNotifications, CHAT_EVENTS.NEW_CONVERSATION, {
            id: conversation.id,
            guestName: conversation.guestName,
            subject: conversation.subject,
            source: conversation.source,
            createdAt: conversation.createdAt,
            lastMessage: initialMessage,
        }).catch(console.error)

        return NextResponse.json(conversation, { status: 201 })
    } catch (error) {
        console.error('Error creating conversation:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

