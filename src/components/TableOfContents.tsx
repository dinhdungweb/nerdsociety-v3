'use client'

import { useEffect, useState } from 'react'
import { ListBulletIcon } from '@heroicons/react/24/outline'

interface TocItem {
    id: string
    text: string
    level: number
}

interface TableOfContentsProps {
    contentSelector?: string
    className?: string
}

export default function TableOfContents({
    contentSelector = '.prose',
    className = ''
}: TableOfContentsProps) {
    const [toc, setToc] = useState<TocItem[]>([])
    const [activeId, setActiveId] = useState<string>('')
    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        // Find all headings in the content
        const content = document.querySelector(contentSelector)
        if (!content) return

        const headings = content.querySelectorAll('h1, h2, h3, h4')
        const items: TocItem[] = []

        headings.forEach((heading, index) => {
            // Generate ID if not exists
            if (!heading.id) {
                heading.id = `heading-${index}`
            }

            items.push({
                id: heading.id,
                text: heading.textContent || '',
                level: parseInt(heading.tagName.charAt(1)),
            })
        })

        setToc(items)

        // Set up intersection observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            {
                rootMargin: '-80px 0px -80% 0px',
            }
        )

        headings.forEach((heading) => observer.observe(heading))

        return () => observer.disconnect()
    }, [contentSelector])

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 100 // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            })
        }
    }

    if (toc.length === 0) return null

    return (
        <div className={`bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <ListBulletIcon className="size-5 text-primary-600 dark:text-primary-400" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                        Mục lục
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        ({toc.length} mục)
                    </span>
                </div>
                <svg
                    className={`size-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Items */}
            {isOpen && (
                <nav className="px-4 pb-4">
                    <ul className="space-y-1">
                        {toc.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => scrollToHeading(item.id)}
                                    className={`
                                        w-full text-left py-1.5 px-3 rounded-lg text-sm transition-colors
                                        ${item.level === 1 ? 'font-medium' : ''}
                                        ${item.level === 2 ? 'pl-4' : ''}
                                        ${item.level === 3 ? 'pl-6' : ''}
                                        ${item.level === 4 ? 'pl-8' : ''}
                                        ${activeId === item.id
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 hover:text-neutral-900 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    <span className="line-clamp-1">{item.text}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </div>
    )
}
