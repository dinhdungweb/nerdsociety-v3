export interface Message {
    id: string
    content: string
    attachments?: string[]
    senderType: 'GUEST' | 'STAFF' | 'SYSTEM'
    senderName?: string
    createdAt: string
}

export interface Conversation {
    id: string
    guestName: string | null
    guestPhone: string | null
    status: 'OPEN' | 'ASSIGNED' | 'RESOLVED' | 'CLOSED'
    source: string | null
    subject: string | null
    unreadCount: number
    lastMessageAt: string | null
    createdAt: string
    messages: Message[]
}
