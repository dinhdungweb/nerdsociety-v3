import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import {
    CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { HeaderNerd, FooterNerd } from '@/components/landing'
import PostCard from '@/components/PostCard'
import NewsTabs from './NewsTabs'

export const metadata: Metadata = {
    title: 'Tin tức & Sự kiện',
    description: 'Cập nhật những hoạt động mới nhất từ Nerd Society',
}

interface PageProps {
    searchParams: Promise<{ type?: string; page?: string }>
}

async function getPosts(type?: string, page = 1, limit = 9) {
    const where: Record<string, unknown> = {
        status: 'PUBLISHED',
    }
    if (type && type !== 'ALL') {
        where.type = type
    }

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            orderBy: [
                { featured: 'desc' },
                { publishedAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                excerpt: true,
                thumbnail: true,
                publishedAt: true,
                eventDate: true,
                eventTime: true,
                eventLocation: true,
                featured: true,
                author: { select: { name: true } },
            },
        }),
        prisma.post.count({ where }),
    ])

    return { posts, total, totalPages: Math.ceil(total / limit) }
}

async function getSettings() {
    try {
        const settings = await prisma.setting.findMany()
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {} as Record<string, string>)
    } catch {
        return {}
    }
}

export default async function NewsListPage({ searchParams }: PageProps) {
    const { type, page } = await searchParams
    const currentPage = parseInt(page || '1')
    const { posts, total, totalPages } = await getPosts(type, currentPage)
    const settings = await getSettings()

    return (
        <>
            <HeaderNerd logoUrl={settings.siteLogo} logoLightUrl={settings.siteLogoLight} />
            <main className="pt-20">
                <div className="py-12 lg:py-16 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="container">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white">
                                Tin tức & Sự kiện
                            </h1>
                            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                                Cập nhật những hoạt động, sự kiện và tin tức mới nhất từ Nerd Society
                            </p>
                        </div>

                        {/* Tabs */}
                        <NewsTabs currentType={type || 'ALL'} />

                        {/* Posts grid */}
                        {posts.length > 0 ? (
                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post as any} />
                                ))}
                            </div>
                        ) : (
                            <div className="mt-8 text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl">
                                <CalendarDaysIcon className="size-16 mx-auto text-neutral-300 dark:text-neutral-600" />
                                <p className="mt-4 text-neutral-500 dark:text-neutral-400">
                                    Chưa có bài viết nào trong danh mục này
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <Link
                                        key={pageNum}
                                        href={`/news?type=${type || 'ALL'}&page=${pageNum}`}
                                        className={`size-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${pageNum === currentPage
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <FooterNerd logoUrl={settings.siteLogoLight || settings.siteLogo} />
        </>
    )
}
