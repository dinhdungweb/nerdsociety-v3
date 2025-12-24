// Pusher Cloud Configuration
import Pusher from 'pusher'

// Tạo Pusher server instance
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID || '',
    key: process.env.PUSHER_KEY || '',
    secret: process.env.PUSHER_SECRET || '',
    cluster: process.env.PUSHER_CLUSTER || 'ap1',
    useTLS: true,
})

// Helper để trigger events
export const triggerChatEvent = async (
    channel: string,
    event: string,
    data: any
) => {
    try {
        await pusherServer.trigger(channel, event, data)
    } catch (error) {
        console.error('Pusher trigger error:', error)
    }
}

// Chat channels
export const CHAT_CHANNELS = {
    // Private channel cho từng conversation
    conversation: (conversationId: string) => `private-chat-${conversationId}`,
    // Channel cho admin nhận notification
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

// Notification channels (public - no auth required)
export const NOTIFICATION_CHANNELS = {
    admin: 'admin-notifications',
}

// Notification events
export const NOTIFICATION_EVENTS = {
    NEW_NOTIFICATION: 'new-notification',
    NOTIFICATION_READ: 'notification-read',
}

// Helper để trigger notification events
export const triggerNotification = async (notification: {
    id: string
    type: string
    title: string
    message: string
    link?: string | null
    createdAt: Date | string
}) => {
    try {
        await pusherServer.trigger(NOTIFICATION_CHANNELS.admin, NOTIFICATION_EVENTS.NEW_NOTIFICATION, {
            ...notification,
            createdAt: notification.createdAt instanceof Date ? notification.createdAt.toISOString() : notification.createdAt,
            isRead: false,
        })
    } catch (error) {
        console.error('Failed to trigger notification:', error)
    }
}
