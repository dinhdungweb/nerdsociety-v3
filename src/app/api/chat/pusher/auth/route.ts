'use server'

import { NextRequest, NextResponse } from 'next/server'
import { pusherServer } from '@/lib/pusher-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Staff-like roles allowed to access admin channels
const ADMIN_CHANNEL_ROLES = ['ADMIN', 'MANAGER', 'STAFF']

// Pusher authentication endpoint cho private channels
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const socketId = formData.get('socket_id') as string
        const channel = formData.get('channel_name') as string

        if (!socketId || !channel) {
            return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 })
        }

        // Kiểm tra quyền truy cập channel
        // Private channels bắt đầu bằng 'private-'
        if (channel.startsWith('private-admin')) {
            // Chỉ admin/staff mới được subscribe admin channels
            const session = await getServerSession(authOptions)
            if (!session?.user?.email) {
                return NextResponse.json({ error: 'Unauthorized - Login required' }, { status: 401 })
            }

            const role = session.user.role as string
            if (!ADMIN_CHANNEL_ROLES.includes(role)) {
                return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
            }
        }

        // Authorize the channel
        const authResponse = pusherServer.authorizeChannel(socketId, channel)

        return NextResponse.json(authResponse)
    } catch (error) {
        console.error('Pusher auth error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
