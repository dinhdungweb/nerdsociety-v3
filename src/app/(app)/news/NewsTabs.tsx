'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface NewsTabsProps {
    currentType: string
}

export default function NewsTabs({ currentType }: NewsTabsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleTabChange = (type: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('type', type)
        params.delete('page') // Reset to first page
        router.push(`/news?${params.toString()}`)
    }

    const tabs = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'NEWS', label: 'Tin tức' },
        { id: 'EVENT', label: 'Sự kiện' },
    ]

    return (
        <div className="flex justify-center gap-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${currentType === tab.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
