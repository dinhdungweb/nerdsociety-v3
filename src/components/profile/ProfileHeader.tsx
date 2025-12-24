'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import {
    ClockIcon,
    Cog6ToothIcon,
    SparklesIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface ProfileHeaderProps {
    user: {
        name: string | null
        email: string | null
        avatar: string | null
        nerdCoinBalance?: number
        nerdCoinTier?: string
    }
}

const navigation = [
    { name: 'Lịch sử đặt lịch', href: '/profile', icon: ClockIcon },
    { name: 'Nerd Member', href: '/profile/nerdcoin', icon: SparklesIcon },
    { name: 'Cài đặt tài khoản', href: '/profile/settings', icon: Cog6ToothIcon },
]

const tierColors: Record<string, string> = {
    BRONZE: 'from-amber-600 to-amber-800',
    SILVER: 'from-slate-400 to-slate-600',
    GOLD: 'from-yellow-400 to-yellow-600',
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
    const pathname = usePathname()
    const tier = user.nerdCoinTier || 'BRONZE'

    return (
        <div className="space-y-6">
            {/* User Info Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white shadow-xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <circle cx="1" cy="1" r="1" fill="currentColor" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="size-20 overflow-hidden rounded-full border-4 border-white/30 bg-white/20 shadow-lg sm:size-24">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="size-full object-cover" />
                            ) : (
                                <UserCircleIcon className="size-full text-white/70" />
                            )}
                        </div>
                        {/* Tier Badge */}
                        <div className={`absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r ${tierColors[tier]} px-2 py-0.5 text-xs font-bold shadow-lg`}>
                            {tier}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            {user.name || 'Người dùng'}
                        </h1>
                        <p className="mt-1 text-white/70">
                            {user.email}
                        </p>

                        {/* Stats */}
                        <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
                            <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                                <div className="text-lg font-bold">{user.nerdCoinBalance || 0}</div>
                                <div className="text-xs text-white/60">Nerd Coins</div>
                            </div>
                            <Link
                                href="/booking"
                                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-primary-600 transition-transform hover:scale-105"
                            >
                                Đặt lịch mới
                                <ChevronRightIcon className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-sm dark:bg-neutral-800">
                {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/profile' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <item.icon className="size-5" />
                            <span className="hidden sm:inline">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
