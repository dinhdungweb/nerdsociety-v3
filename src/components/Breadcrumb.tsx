'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
            {/* Home icon */}
            <Link
                href="/"
                className="flex-shrink-0 text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
            >
                <HomeIcon className="size-4" />
            </Link>

            {/* All items */}
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    <ChevronRightIcon className="size-3 text-neutral-400 flex-shrink-0" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-neutral-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-neutral-900 dark:text-white font-medium">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    )
}


