'use client'

import { ThemeContext } from '@/app/theme-provider'
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    MoonIcon,
    SunIcon,
    ChevronDownIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useContext, useState, useRef, useEffect } from 'react'
import NotificationBell from './NotificationBell'
import QuickChatPanel from './QuickChatPanel'

interface AdminNavbarProps {
    onMenuClick: () => void
    isCollapsed?: boolean
    onCollapse?: (value: boolean) => void
}

export default function AdminNavbar({ onMenuClick, isCollapsed, onCollapse }: AdminNavbarProps) {
    const { data: session } = useSession()
    const themeContext = useContext(ThemeContext)
    const isDarkMode = themeContext?.isDarkMode ?? false
    const [userDropdownOpen, setUserDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6 dark:border-neutral-800 dark:bg-neutral-900">
            {/* Left side - Menu toggle & Search */}
            <div className="flex items-center gap-4">
                {/* Mobile menu toggle */}
                <button
                    type="button"
                    className="cursor-pointer rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden dark:text-neutral-400 dark:hover:bg-neutral-800"
                    onClick={onMenuClick}
                >
                    <Bars3Icon className="size-5" />
                </button>

                {/* Desktop collapse toggle */}
                <button
                    type="button"
                    className="hidden cursor-pointer rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 lg:block dark:text-neutral-400 dark:hover:bg-neutral-800"
                    onClick={() => onCollapse?.(!isCollapsed)}
                >
                    <Bars3Icon className="size-5" />
                </button>

                {/* Search bar */}
                <div className="hidden sm:block">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search or type command..."
                            className="w-64 rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-600 placeholder-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:placeholder-neutral-500 dark:focus:bg-neutral-800 lg:w-80"
                        />
                        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 lg:inline-block dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <button
                    type="button"
                    onClick={() => themeContext?.toggleDarkMode()}
                    className="cursor-pointer rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                >
                    {isDarkMode ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
                </button>

                {/* Quick Chat Panel */}
                <QuickChatPanel />

                {/* Notifications */}
                <NotificationBell />

                {/* Divider */}
                <div className="mx-2 h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 pr-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                            {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="hidden text-left lg:block">
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                {session?.user?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {session?.user?.email}
                            </p>
                        </div>
                        <ChevronDownIcon className={`hidden size-4 text-neutral-400 transition-transform lg:block ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    {userDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                            {/* User info */}
                            <div className="border-b border-neutral-100 px-4 pb-3 dark:border-neutral-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                                        {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">
                                            {session?.user?.role === 'ADMIN' ? 'Admin' : 'Staff'} {session?.user?.name?.split(' ')[0] || 'Nerd Society'}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {session?.user?.email || 'admin@nerdsociety.com'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div className="py-2">
                                <button
                                    onClick={() => themeContext?.toggleDarkMode()}
                                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                >
                                    {isDarkMode ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </button>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <ArrowLeftOnRectangleIcon className="size-5" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
