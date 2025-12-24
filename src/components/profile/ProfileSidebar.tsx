'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ClockIcon,
    UserIcon,
    Cog6ToothIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Lịch sử đặt lịch', href: '/profile', icon: ClockIcon },
    { name: 'Nerd Member', href: '/profile/nerdcoin', icon: CurrencyDollarIcon },
    { name: 'Cài đặt tài khoản', href: '/profile/settings', icon: Cog6ToothIcon },
]

export default function ProfileSidebar() {
    const pathname = usePathname()

    return (
        <nav className="space-y-1">
            {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                            }`}
                    >
                        <item.icon
                            className={`mr-3 size-5 flex-shrink-0 transition-colors ${isActive
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-neutral-400 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-300'
                                }`}
                            aria-hidden="true"
                        />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )
}
