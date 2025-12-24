'use client'

import { PhoneIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'

interface FloatingButton {
    id: string
    label: string
    type: 'phone' | 'chat' | 'zalo' | 'messenger' | 'link' | 'email'
    value: string
    icon: string
    bgColor: string
    textColor: string
    isActive: boolean
    order: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function FloatingContact() {
    const [isVisible, setIsVisible] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const pathname = usePathname()

    // Hide on admin pages
    const isAdminPage = pathname?.startsWith('/admin')

    // Fetch buttons from API
    const { data } = useSWR<{ buttons: FloatingButton[] }>(
        isAdminPage ? null : '/api/admin/settings/floating-buttons',
        fetcher,
        { revalidateOnFocus: false }
    )

    const activeButtons = data?.buttons?.filter(btn => btn.isActive) || []

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling down a bit
            setIsVisible(window.scrollY > 200)
        }

        window.addEventListener('scroll', handleScroll)
        // Check initial scroll position
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Don't render on admin pages or if no buttons configured
    if (isAdminPage) return null
    if (!data && !activeButtons.length) return null

    const getHref = (btn: FloatingButton) => {
        switch (btn.type) {
            case 'phone':
                return `tel:${btn.value}`
            case 'email':
                return `mailto:${btn.value}`
            case 'zalo':
                return btn.value.startsWith('http') ? btn.value : `https://zalo.me/${btn.value}`
            case 'messenger':
                return btn.value.startsWith('http') ? btn.value : `https://m.me/${btn.value}`
            case 'link':
                return btn.value
            case 'chat':
                return '#chat' // Will be handled by onClick
            default:
                return btn.value
        }
    }

    const handleClick = (btn: FloatingButton, e: React.MouseEvent) => {
        if (btn.type === 'chat') {
            e.preventDefault()
            // Toggle chat widget
            const chatWidget = document.getElementById('live-chat-widget')
            if (chatWidget) {
                chatWidget.classList.toggle('hidden')
            }
            // Or dispatch a custom event to open chat
            window.dispatchEvent(new CustomEvent('openChat'))
        }
        setIsExpanded(false)
    }

    const renderIcon = (icon: string, className: string = 'size-5') => {
        switch (icon) {
            case 'phone':
                return <PhoneIcon className={className} />
            case 'chat':
                return <ChatBubbleLeftRightIcon className={className} />
            case 'email':
                return <EnvelopeIcon className={className} />
            case 'zalo':
                return (
                    <svg className={className} viewBox="0 0 48 48" fill="currentColor">
                        <path d="M24 1C11.3 1 1 11.3 1 24s10.3 23 23 23 23-10.3 23-23S36.7 1 24 1zm10.9 31.4c-.4.8-2 1.6-2.8 1.7-.8.1-1.5.4-5.2-1.1-4.4-1.8-7.2-6.3-7.4-6.6-.2-.3-1.8-2.4-1.8-4.6s1.1-3.3 1.5-3.7.9-.6 1.2-.6h.9c.3 0 .7 0 1.1.8.4.9 1.3 3.2 1.4 3.4.1.2.2.5 0 .8-.1.3-.2.5-.4.7-.2.3-.4.5-.6.8-.2.2-.4.5-.2.9.2.4 1 1.8 2.2 2.9 1.5 1.4 2.8 1.9 3.2 2.1.4.2.6.2.9-.1.2-.3.9-1.1 1.2-1.5.3-.4.5-.3.9-.2.4.1 2.4 1.1 2.8 1.3.4.2.7.3.8.5.1.2.1 1.2-.3 2z" />
                    </svg>
                )
            case 'messenger':
                return (
                    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.733 8l3.131 3.259L19.752 8l-6.561 6.963z" />
                    </svg>
                )
            case 'link':
                return <LinkIcon className={className} />
            default:
                return <LinkIcon className={className} />
        }
    }

    // If only one button, show simple floating button
    if (activeButtons.length === 1) {
        const btn = activeButtons[0]
        return (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
                className="fixed bottom-24 right-6 z-40"
            >
                <a
                    href={getHref(btn)}
                    onClick={(e) => handleClick(btn, e)}
                    className="group relative flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: btn.bgColor, color: btn.textColor }}
                    aria-label={btn.label}
                >
                    <span
                        className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
                        style={{ backgroundColor: btn.bgColor }}
                    />
                    {renderIcon(btn.icon, 'relative size-6')}
                </a>
            </motion.div>
        )
    }

    // Multiple buttons - show expandable FAB
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
            className="fixed bottom-24 right-6 z-40"
        >
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-16 right-0 flex flex-col items-end gap-3"
                    >
                        {activeButtons.map((btn, index) => (
                            <motion.div
                                key={btn.id}
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-2"
                            >
                                <span className="whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 shadow-lg dark:bg-neutral-800 dark:text-white">
                                    {btn.label}
                                </span>
                                <a
                                    href={getHref(btn)}
                                    onClick={(e) => handleClick(btn, e)}
                                    className="flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
                                    style={{ backgroundColor: btn.bgColor, color: btn.textColor }}
                                    aria-label={btn.label}
                                >
                                    {renderIcon(btn.icon)}
                                </a>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group relative flex size-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-transform hover:scale-110"
                aria-label={isExpanded ? 'Đóng menu' : 'Mở menu liên hệ'}
            >
                {!isExpanded && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-400 opacity-75" />
                )}
                <motion.div
                    animate={{ rotate: isExpanded ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isExpanded ? (
                        <XMarkIcon className="size-6" />
                    ) : (
                        <PhoneIcon className="size-6" />
                    )}
                </motion.div>
            </button>
        </motion.div>
    )
}
