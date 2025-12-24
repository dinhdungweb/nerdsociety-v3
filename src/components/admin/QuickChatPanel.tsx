'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import useSWR from 'swr'
import { useAdminChat } from '@/contexts/AdminChatContext'
import { Conversation } from '../../types/chat'
import { usePermissions } from '@/contexts/PermissionsContext'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function QuickChatPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { openChat, closeChat } = useAdminChat()
    const { hasPermission } = usePermissions()

    // Check permission - but call this after all hooks
    const canViewChat = hasPermission('canViewChat')

    // Fetch conversations (only if has permission)
    const { data: conversations } = useSWR<Conversation[]>(
        canViewChat ? '/api/chat/conversations' : null,
        fetcher,
        { refreshInterval: 10000 }
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Hide chat panel if user doesn't have chat permission (after all hooks)
    if (!canViewChat) {
        return null
    }

    const unreadTotal = Array.isArray(conversations)
        ? conversations.reduce((sum, c) => sum + c.unreadCount, 0)
        : 0
    const recentConversations = Array.isArray(conversations)
        ? conversations.slice(0, 10)
        : []

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins}p`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
        return date.toLocaleDateString('vi-VN')
    }

    const handleConversationClick = (conv: Conversation) => {
        openChat(conv)
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
                <ChatBubbleLeftRightIcon className="size-5" />
                {unreadTotal > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                            Chat hỗ trợ
                        </h3>
                        <Link
                            href="/admin/chat"
                            className="text-xs text-primary-600 hover:text-primary-700"
                            onClick={() => setIsOpen(false)}
                        >
                            Xem tất cả
                        </Link>
                    </div>

                    {/* Conversation List */}
                    <div className="max-h-80 overflow-y-auto">
                        {recentConversations.length === 0 ? (
                            <div className="p-4 text-center text-sm text-neutral-500">
                                Không có tin nhắn mới
                            </div>
                        ) : (
                            recentConversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => handleConversationClick(conv)}
                                    className="cursor-pointer border-b border-neutral-100 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                                                {(conv.guestName || 'K')[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                    {conv.guestName || 'Khách'}
                                                </p>
                                                <p className="truncate text-xs text-neutral-500">
                                                    {conv.messages?.[0]?.content || 'Cuộc hội thoại mới'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                                            <span className="text-[10px] text-neutral-400">
                                                {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                                            </span>
                                            {conv.unreadCount > 0 && (
                                                <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
