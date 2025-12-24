'use client'

import { useState, useEffect, useRef, ReactNode, useCallback } from 'react'
import {
    BellIcon,
    CheckIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    XCircleIcon,
    CurrencyDollarIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { BellAlertIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { getPusherClient, NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS } from '@/lib/pusher-client'
import toast from 'react-hot-toast'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
}

const typeIcons: Record<string, { icon: ReactNode; color: string }> = {
    BOOKING_NEW: { icon: <CalendarDaysIcon className="size-5" />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    BOOKING_CONFIRMED: { icon: <CheckCircleIcon className="size-5" />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    BOOKING_CANCELLED: { icon: <XCircleIcon className="size-5" />, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    PAYMENT_RECEIVED: { icon: <CurrencyDollarIcon className="size-5" />, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    CHECKIN: { icon: <ArrowRightOnRectangleIcon className="size-5" />, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    CHECKOUT: { icon: <ArrowLeftOnRectangleIcon className="size-5" />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    SYSTEM: { icon: <Cog6ToothIcon className="size-5" />, color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400' },
    OVERTIME: { icon: <ExclamationTriangleIcon className="size-5" />, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    ENDING_SOON: { icon: <ClockIcon className="size-5" />, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'booking' | 'activity'>('all')
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Filter categories
    const filterTabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'urgent', label: 'Khẩn' },
        { id: 'booking', label: 'Booking' },
        { id: 'activity', label: 'Hoạt động' },
    ] as const

    // Helper to check if notification is urgent
    const isUrgentNotification = (n: Notification) =>
        n.title.includes('quá giờ') ||
        n.title.includes('Sắp hết') ||
        n.type === 'BOOKING_CANCELLED'

    // Filtered notifications based on active tab
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true
        if (activeTab === 'urgent') return isUrgentNotification(n)
        if (activeTab === 'booking') return ['BOOKING_NEW', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_RECEIVED'].includes(n.type)
        if (activeTab === 'activity') return ['CHECKIN', 'CHECKOUT'].includes(n.type) || n.title.includes('quá giờ') || n.title.includes('Sắp hết')
        return true
    })

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/notifications?limit=10')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
        // Poll for new notifications every 60 seconds as backup
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Real-time notifications via Pusher
    useEffect(() => {
        const pusher = getPusherClient()
        const channel = pusher.subscribe(NOTIFICATION_CHANNELS.admin)

        channel.bind(NOTIFICATION_EVENTS.NEW_NOTIFICATION, (newNotification: Notification) => {
            // Add new notification to the top of the list
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)])
            setUnreadCount(prev => prev + 1)

            // Show toast notification
            toast(newNotification.title, {
                icon: '🔔',
                duration: 4000,
            })
        })

        return () => {
            channel.unbind_all()
            pusher.unsubscribe(NOTIFICATION_CHANNELS.admin)
        }
    }, [])

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAllAsRead = async () => {
        if (unreadCount === 0) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true }),
            })
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                setUnreadCount(0)
            }
        } catch (error) {
            console.error('Error marking notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] }),
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking notification:', error)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex size-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
                <BellIcon className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                            >
                                <CheckIcon className="size-3" />
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* Tab Filters */}
                    <div className="flex gap-1 border-b border-neutral-200 px-2 py-2 dark:border-neutral-700">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors
                                    ${activeTab === tab.id
                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                        : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                    }
                                    ${tab.id === 'urgent' && notifications.filter(n => isUrgentNotification(n) && !n.isRead).length > 0
                                        ? 'text-red-600 dark:text-red-400'
                                        : ''
                                    }
                                `}
                            >
                                {tab.label}
                                {tab.id === 'urgent' && notifications.filter(n => isUrgentNotification(n) && !n.isRead).length > 0 && (
                                    <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                                        {notifications.filter(n => isUrgentNotification(n) && !n.isRead).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-80 overflow-y-auto scrollbar-thin">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map(notification => {
                                // Detect important notifications (overtime, ending soon, cancelled)
                                const isUrgent = notification.title.includes('quá giờ') ||
                                    notification.title.includes('Sắp hết') ||
                                    notification.type === 'BOOKING_CANCELLED'

                                const typeStyle = typeIcons[notification.type] || typeIcons.SYSTEM

                                // Override icon for urgent overtime notifications
                                const displayIcon = notification.title.includes('quá giờ')
                                    ? typeIcons.OVERTIME
                                    : notification.title.includes('Sắp hết')
                                        ? typeIcons.ENDING_SOON
                                        : typeStyle

                                const content = (
                                    <div
                                        className={`flex gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 
                                            ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}
                                            ${isUrgent && !notification.isRead ? 'border-l-4 border-red-500 bg-red-50/80 dark:bg-red-900/20' : ''}
                                        `}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    >
                                        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${displayIcon.color} ${isUrgent && !notification.isRead ? 'animate-pulse' : ''}`}>
                                            {displayIcon.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`flex items-center gap-1 text-sm font-medium ${!notification.isRead ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'} ${isUrgent ? 'text-red-700 dark:text-red-400' : ''}`}>
                                                    {isUrgent && (
                                                        notification.title.includes('quá giờ')
                                                            ? <ExclamationTriangleIcon className="size-4 shrink-0" />
                                                            : notification.title.includes('Sắp hết')
                                                                ? <ClockIcon className="size-4 shrink-0" />
                                                                : notification.type === 'BOOKING_CANCELLED'
                                                                    ? <XCircleIcon className="size-4 shrink-0" />
                                                                    : null
                                                    )}
                                                    {notification.title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|⚠️|⏰|✅|❌|💰|📅|🚪|👋|⚙️/gu, '').trim()}
                                                </p>
                                                {isUrgent && !notification.isRead && (
                                                    <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                                                        Khẩn
                                                    </span>
                                                )}
                                                {!notification.isRead && !isUrgent && (
                                                    <span className="size-2 rounded-full bg-primary-500" />
                                                )}
                                            </div>
                                            <p className="mt-0.5 truncate text-sm text-neutral-500 dark:text-neutral-400">
                                                {notification.message}
                                            </p>
                                            <p className="mt-1 text-xs text-neutral-400">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                )

                                return notification.link ? (
                                    <Link key={notification.id} href={notification.link} onClick={() => setIsOpen(false)}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={notification.id}>{content}</div>
                                )
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-neutral-500">
                                <BellIcon className="mx-auto size-8 text-neutral-300" />
                                <p className="mt-2">Không có thông báo mới</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
