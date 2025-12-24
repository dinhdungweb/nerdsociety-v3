'use client'

// Pusher Cloud Client Configuration
import PusherClient from 'pusher-js'

// Tạo Pusher client instance
let pusherClient: PusherClient | null = null

export const getPusherClient = (): PusherClient => {
    if (pusherClient) return pusherClient

    pusherClient = new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_KEY || '',
        {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1',
            authEndpoint: '/api/chat/pusher/auth',
        }
    )

    return pusherClient
}

// Chat channels
export const CHAT_CHANNELS = {
    conversation: (conversationId: string) => `private-chat-${conversationId}`,
    adminNotifications: 'private-admin-chat-notifications',
}

// Chat events
export const CHAT_EVENTS = {
    NEW_MESSAGE: 'new-message',
    MESSAGE_READ: 'message-read',
    NEW_CONVERSATION: 'new-conversation',
    CONVERSATION_UPDATED: 'conversation-updated',
    TYPING: 'typing',
}

// Notification channels
export const NOTIFICATION_CHANNELS = {
    admin: 'admin-notifications',
}

// Notification events
export const NOTIFICATION_EVENTS = {
    NEW_NOTIFICATION: 'new-notification',
    NOTIFICATION_READ: 'notification-read',
}
