'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    UserCircleIcon,
    PhotoIcon,
    PaperAirplaneIcon,
    FaceSmileIcon,
    ClockIcon,
} from '@heroicons/react/24/outline'
import useSWR from 'swr'
import { getPusherClient, CHAT_CHANNELS, CHAT_EVENTS } from '@/lib/pusher-client'
import Image from 'next/image'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Message {
    id: string
    content: string
    attachments?: string[]
    senderType: 'GUEST' | 'STAFF' | 'SYSTEM'
    senderName?: string
    createdAt: string
}

interface Conversation {
    id: string
    guestName: string | null
    guestPhone: string | null
    status: string
    source: string | null
    subject: string | null
    unreadCount: number
    lastMessageAt: string | null
    createdAt: string
    messages: Message[]
}

const statusColors: Record<string, string> = {
    OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ASSIGNED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CLOSED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
}

const statusLabels: Record<string, string> = {
    OPEN: 'Đang chờ',
    ASSIGNED: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    CLOSED: 'Đã đóng',
}

export default function AdminChatPage() {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [replyMessage, setReplyMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const [isTyping, setIsTyping] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

    // Fetch conversations
    const { data: conversations, mutate: mutateConversations, isLoading: isLoadingConversations } = useSWR<Conversation[]>(
        '/api/chat/conversations',
        fetcher,
        { refreshInterval: 10000 }
    )

    // Fetch selected conversation details
    const { data: conversationDetail, mutate: mutateDetail } = useSWR<Conversation>(
        selectedConversation ? `/api/chat/conversations/${selectedConversation.id}` : null,
        fetcher,
        { refreshInterval: 5000 }
    )

    // Pusher real-time subscription for notifications
    useEffect(() => {
        try {
            const pusher = getPusherClient()
            const adminChannel = pusher.subscribe(CHAT_CHANNELS.adminNotifications)

            adminChannel.bind(CHAT_EVENTS.NEW_MESSAGE, () => {
                mutateConversations()
            })

            adminChannel.bind(CHAT_EVENTS.NEW_CONVERSATION, () => {
                mutateConversations()
            })

            return () => {
                adminChannel.unbind_all()
                pusher.unsubscribe(CHAT_CHANNELS.adminNotifications)
            }
        } catch (error) {
            console.error('Pusher connection error:', error)
        }
    }, [mutateConversations])

    // Subscribe to selected conversation events
    useEffect(() => {
        if (!selectedConversation?.id) return

        try {
            const pusher = getPusherClient()
            const channel = pusher.subscribe(CHAT_CHANNELS.conversation(selectedConversation.id))

            channel.bind(CHAT_EVENTS.NEW_MESSAGE, () => {
                mutateDetail()
                setIsTyping(false) // Stop typing indicator if message received
            })

            channel.bind(CHAT_EVENTS.TYPING, (data: { isTyping: boolean, senderType: string }) => {
                if (data.senderType === 'GUEST') {
                    setIsTyping(data.isTyping)
                    // Auto clear typing after 3 seconds
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000)
                }
            })

            return () => {
                channel.unbind_all()
                pusher.unsubscribe(CHAT_CHANNELS.conversation(selectedConversation.id))
            }
        } catch (error) {
            console.error('Pusher connection error:', error)
        }
    }, [selectedConversation?.id, mutateDetail])

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [conversationDetail?.messages, isTyping, previewUrls])

    // Filter conversations
    const filteredConversations = conversations?.filter(conv => {
        const matchesSearch = !searchQuery ||
            conv.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.guestPhone?.includes(searchQuery)
        const matchesStatus = statusFilter === 'ALL' || conv.status === statusFilter
        return matchesSearch && matchesStatus
    }) || []

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return
        const newFiles = files.slice(0, 3 - selectedImages.length)
        setSelectedImages(prev => [...prev, ...newFiles])
        newFiles.forEach(file => {
            setPreviewUrls(prev => [...prev, URL.createObjectURL(file)])
        })
    }

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previewUrls[index])
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
        setPreviewUrls(prev => prev.filter((_, i) => i !== index))
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const uploadImages = async (): Promise<string[]> => {
        const urls: string[] = []
        for (const file of selectedImages) {
            const formData = new FormData()
            formData.append('file', file)
            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData })
                if (res.ok) {
                    const data = await res.json()
                    urls.push(data.url)
                }
            } catch { }
        }
        return urls
    }

    const sendReply = async () => {
        if ((!replyMessage.trim() && selectedImages.length === 0) || !selectedConversation) return

        setIsSending(true)
        const attachments = await uploadImages()

        // Clean up
        previewUrls.forEach(url => URL.revokeObjectURL(url))
        setSelectedImages([])
        setPreviewUrls([])
        setReplyMessage('')

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = '46px'
        }

        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    content: replyMessage.trim(),
                    attachments,
                    senderType: 'STAFF',
                    senderName: 'Nhân viên',
                }),
            })

            if (res.ok) {
                mutateDetail()
                mutateConversations()
            }
        } catch (error) {
            console.error('Error sending reply:', error)
        } finally {
            setIsSending(false)
        }
    }

    const updateStatus = async (status: string) => {
        if (!selectedConversation) return
        try {
            await fetch(`/api/chat/conversations/${selectedConversation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            mutateConversations()
            mutateDetail()
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins} phút`
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ`
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }

    // Group messages by date
    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {}
        messages.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
            if (!groups[date]) groups[date] = []
            groups[date].push(msg)
        })
        return groups
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-4">
            {/* Conversation List */}
            <div className="flex w-95 flex-shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                {/* Header */}
                <div className="border-b border-neutral-200 p-4 dark:border-neutral-700">
                    <h1 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                        <ChatBubbleLeftRightIcon className="size-5" />
                        Chat hỗ trợ
                    </h1>

                    {/* Search */}
                    <div className="relative mt-3">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm SDT, Tên..."
                            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="mt-3 flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                        {['ALL', 'OPEN', 'ASSIGNED', 'RESOLVED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${statusFilter === status
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
                                    }`}
                            >
                                {status === 'ALL' ? 'Tất cả' : statusLabels[status]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation Items */}
                <div className="flex-1 overflow-y-auto">
                    {isLoadingConversations && filteredConversations.length === 0 ? (
                        <div className="flex flex-col gap-2 p-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                            ))}
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-neutral-400">
                            <ChatBubbleLeftRightIcon className="size-12 opacity-20" />
                            <p className="mt-2 text-sm">Chưa có tin nhắn</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`relative cursor-pointer border-b border-neutral-100 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 ${selectedConversation?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                                    }`}
                            >
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${conv.status === 'OPEN' ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-600'
                                            }`}>
                                            {(conv.guestName || 'K')[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`truncate text-sm font-semibold text-neutral-900 dark:text-white ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                                                {conv.guestName || 'Khách'}
                                            </p>
                                            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                                                {conv.messages?.[0]?.content ? (
                                                    conv.messages[0].content
                                                ) : (
                                                    <span className="italic">Đã ghim ảnh</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                                        <span className="text-[10px] text-neutral-400">
                                            {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                                        </span>
                                        {conv.unreadCount > 0 && (
                                            <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[conv.status]}`}>
                                        {statusLabels[conv.status]}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Detail */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                {selectedConversation && conversationDetail ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                    <UserCircleIcon className="size-6" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white">
                                        {conversationDetail.guestName || 'Khách'}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        {conversationDetail.guestPhone && <span>{conversationDetail.guestPhone}</span>}
                                        {conversationDetail.guestPhone && conversationDetail.source && <span>•</span>}
                                        {conversationDetail.source && (
                                            <span>
                                                {conversationDetail.source === '/' ? 'Trang chủ' : conversationDetail.source}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {conversationDetail.status !== 'RESOLVED' && (
                                    <button
                                        onClick={() => updateStatus('RESOLVED')}
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                                    >
                                        <CheckCircleIcon className="size-4" />
                                        Đã giải quyết
                                    </button>
                                )}
                                {conversationDetail.status !== 'CLOSED' && (
                                    <button
                                        onClick={() => updateStatus('CLOSED')}
                                        className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300"
                                    >
                                        <XMarkIcon className="size-4" />
                                        Đóng
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:bg-black/20 dark:scrollbar-thumb-neutral-700">
                            {Object.entries(groupMessagesByDate(conversationDetail.messages)).map(([date, msgs]) => (
                                <div key={date} className="mb-6">
                                    <div className="mb-4 flex justify-center">
                                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                            {date}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {msgs.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex w-full ${msg.senderType === 'STAFF' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex max-w-[70%] items-end gap-2 ${msg.senderType === 'STAFF' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    {/* Avatar */}
                                                    <div className="flex-shrink-0">
                                                        {msg.senderType === 'STAFF' ? (
                                                            <div className="flex size-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
                                                                <span className="text-xs font-bold">NV</span>
                                                            </div>
                                                        ) : msg.senderType === 'SYSTEM' ? (
                                                            <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200">
                                                                <ClockIcon className="size-4 text-neutral-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex size-8 items-center justify-center rounded-full bg-white text-neutral-400 shadow-sm border border-neutral-100">
                                                                <UserCircleIcon className="size-5" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bubble */}
                                                    <div>
                                                        {msg.senderType !== 'SYSTEM' && (
                                                            <p className={`mb-1 text-[10px] text-neutral-400 ${msg.senderType === 'STAFF' ? 'text-right' : 'text-left'}`}>
                                                                {msg.senderName || (msg.senderType === 'STAFF' ? 'Nhân viên' : 'Khách')} • {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        )}
                                                        <div
                                                            className={`rounded-2xl px-4 py-2.5 ${msg.senderType === 'STAFF'
                                                                ? 'bg-primary-600 text-white rounded-tr-sm'
                                                                : msg.senderType === 'SYSTEM'
                                                                    ? 'bg-neutral-100 text-neutral-500 text-center text-xs italic py-1 px-3 w-full'
                                                                    : 'bg-white text-neutral-900 border border-neutral-100 rounded-tl-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white'
                                                                }`}
                                                        >
                                                            {msg.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>}

                                                            {/* Attachments */}
                                                            {msg.attachments && msg.attachments.length > 0 && (
                                                                <div className={`grid gap-2 mt-2 ${msg.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                                    {msg.attachments.map((url, idx) => (
                                                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg">
                                                                            <img src={url} alt="Attachment" className="h-auto w-full object-cover hover:opacity-90 transition-opacity" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="mb-4 flex w-full justify-start">
                                    <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 dark:bg-neutral-800">
                                        <div className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]"></div>
                                        <div className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]"></div>
                                        <div className="size-2 animate-bounce rounded-full bg-neutral-400"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        {conversationDetail.status !== 'CLOSED' && (
                            <div className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
                                {/* Image Preview */}
                                {previewUrls.length > 0 && (
                                    <div className="mb-3 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="relative size-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200">
                                                <img src={url} alt="Preview" className="size-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                                                >
                                                    <XMarkIcon className="size-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {/* Upload Button */}
                                    <div className="flex flex-shrink-0 items-center justify-center pb-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageSelect}
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={selectedImages.length >= 3}
                                            className={`rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-600 dark:text-neutral-400 dark:hover:bg-neutral-700 ${selectedImages.length >= 3 ? 'cursor-not-allowed opacity-50' : ''
                                                }`}
                                            title="Gửi ảnh"
                                        >
                                            <PhotoIcon className="size-6" />
                                        </button>
                                    </div>

                                    {/* Text Input */}
                                    <div className="relative flex-1">
                                        <textarea
                                            ref={textareaRef}
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    sendReply()
                                                }
                                            }}
                                            placeholder="Nhập phản hồi... (Enter để gửi)"
                                            rows={1}
                                            className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm scrollbar-thin focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-primary-500 dark:focus:bg-neutral-900"
                                            style={{ minHeight: '46px' }}
                                        />
                                    </div>

                                    {/* Send Button */}
                                    <div className="flex flex-shrink-0 items-center justify-center pb-1">
                                        <button
                                            onClick={sendReply}
                                            disabled={(!replyMessage.trim() && selectedImages.length === 0) || isSending}
                                            className="flex items-center justify-center rounded-full bg-primary-600 p-2.5 text-white shadow-md transition-transform hover:scale-105 hover:bg-primary-700 disabled:scale-100 disabled:opacity-50"
                                        >
                                            <PaperAirplaneIcon className="size-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50 text-neutral-400 dark:bg-neutral-900/50">
                        <div className="flex size-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <ChatBubbleLeftRightIcon className="size-10 text-neutral-300 dark:text-neutral-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">Admin Chat Dashboard</h3>
                        <p className="mt-2 max-w-xs text-center text-sm">
                            Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu hỗ trợ khách hàng.
                        </p>
                    </div>
                )}
            </div>
        </div >
    )
}
