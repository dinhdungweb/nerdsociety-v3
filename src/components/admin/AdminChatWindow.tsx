'use client'

import React, { useRef, useEffect, useState } from 'react'
import {
    XMarkIcon,
    MinusIcon,
    PaperAirplaneIcon,
    PhotoIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline'
import { useAdminChat } from '@/contexts/AdminChatContext'
import useSWR from 'swr'
import Image from 'next/image'
import { Conversation } from '../../types/chat'
import { usePermissions } from '@/contexts/PermissionsContext'

// Reusing fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminChatWindow() {
    const { activeConversation, isOpen, isMinimized, closeChat, minimizeChat, maximizeChat } = useAdminChat()
    const [replyMessage, setReplyMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { hasPermission } = usePermissions()

    // Check permission
    const canViewChat = hasPermission('canViewChat')

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            const scrollHeight = textareaRef.current.scrollHeight
            const maxHeight = 120

            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`

            if (scrollHeight > maxHeight) {
                textareaRef.current.style.overflowY = 'auto'
            } else {
                textareaRef.current.style.overflowY = 'hidden'
            }
        }
    }, [replyMessage])

    // Fetch conversation details to get real-time messages
    // Note: In a real app we might want to share this SWR cache with the main chat page
    const { data: conversation, mutate } = useSWR<Conversation>(
        isOpen && activeConversation && canViewChat ? `/api/chat/conversations/${activeConversation.id}` : null,
        fetcher,
        { refreshInterval: 5000 }
    )

    // Scroll to bottom on new messages
    useEffect(() => {
        if (isOpen && !isMinimized && conversation?.messages) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [conversation?.messages, isOpen, isMinimized])

    // Hide if no permission or not open
    if (!canViewChat || !isOpen || !activeConversation) return null

    const handleSend = async () => {
        if (!replyMessage.trim()) return

        setIsSending(true)
        try {
            await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: activeConversation.id,
                    content: replyMessage.trim(),
                    senderType: 'STAFF',
                    senderName: 'Nhân viên',
                }),
            })
            setReplyMessage('')
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = '38px' // or whatever minHeight is set to
            }
            mutate() // Refresh messages
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setIsSending(false)
        }
    }

    // Minimized State (Bubble)
    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-6 z-50 flex items-center gap-2">
                <button
                    onClick={maximizeChat}
                    className="flex items-center gap-2 rounded-t-lg bg-white px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] transition-transform dark:bg-neutral-800"
                >
                    <div className="relative">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                            {(activeConversation.guestName || 'K')[0].toUpperCase()}
                        </div>
                        {activeConversation.unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {activeConversation.unreadCount}
                            </span>
                        )}
                    </div>
                    <span className="max-w-[150px] truncate text-sm font-semibold text-neutral-900 dark:text-white">
                        {activeConversation.guestName || 'Khách'}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            closeChat()
                        }}
                        className="ml-2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                        <XMarkIcon className="size-4" />
                    </button>
                </button>
            </div>
        )
    }

    // Expanded State (Chat Window)
    return (
        <div className="fixed bottom-0 right-6 z-50 flex h-[450px] w-[330px] flex-col overflow-hidden rounded-t-xl bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.15)] ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2.5 bg-white dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex flex-1 cursor-pointer items-center gap-2" onClick={minimizeChat}>
                    <div className="relative">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30">
                            {(activeConversation.guestName || 'K')[0].toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-neutral-900"></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                            {activeConversation.guestName || 'Khách'}
                        </span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {[
                                activeConversation.guestPhone,
                                activeConversation.source === '/' ? 'Trang chủ' : activeConversation.source
                            ].filter(Boolean).join(' • ')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={minimizeChat}
                        className="rounded-full p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                    >
                        <MinusIcon className="size-5" />
                    </button>
                    <button
                        onClick={closeChat}
                        className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <XMarkIcon className="size-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-3 scrollbar-thin dark:bg-black/20">
                <div className="flex flex-col gap-3">
                    {(conversation || activeConversation).messages?.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex w-full ${msg.senderType === 'STAFF' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] items-end gap-2 ${msg.senderType === 'STAFF' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar (Small) */}
                                <div className="flex-shrink-0">
                                    {msg.senderType === 'STAFF' ? (
                                        <div className="flex size-6 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
                                            <span className="text-[8px] font-bold">NV</span>
                                        </div>
                                    ) : msg.senderType === 'SYSTEM' ? (
                                        <div className="flex size-6 items-center justify-center rounded-full bg-neutral-200">
                                            <div className="size-3 bg-neutral-400 rounded-full" />
                                        </div>
                                    ) : (
                                        <div className="flex size-6 items-center justify-center rounded-full bg-white text-neutral-400 border border-neutral-100">
                                            <UserCircleIcon className="size-4" />
                                        </div>
                                    )}
                                </div>

                                <div
                                    className={`relative px-3 py-2 text-sm ${msg.senderType === 'STAFF'
                                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
                                        : msg.senderType === 'SYSTEM'
                                            ? 'w-full text-center text-xs text-neutral-500 italic bg-transparent shadow-none'
                                            : 'bg-white text-neutral-900 border border-neutral-100 rounded-2xl rounded-tl-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white'
                                        }`}
                                >
                                    {msg.content}

                                    {/* Attachments */}
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className={`grid gap-1 mt-1 ${msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {msg.attachments.map((url, idx) => (
                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md">
                                                    <img src={url} alt="Attachment" className="h-auto w-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Footer */}
            <div className="border-t border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                    <div className="flex items-center pb-2">
                        <button className="text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400">
                            <PhotoIcon className="size-6" />
                        </button>
                    </div>
                    <div className="relative flex-1">
                        <textarea
                            ref={textareaRef}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder="Nhập tin nhắn..."
                            rows={1}
                            className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm scrollbar-thin focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
                            style={{ minHeight: '38px' }}
                        />
                    </div>
                    <div className="flex items-center pb-1">
                        <button
                            onClick={handleSend}
                            disabled={!replyMessage.trim() || isSending}
                            className="flex items-center justify-center rounded-full bg-primary-600 p-2 text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
                        >
                            <PaperAirplaneIcon className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
