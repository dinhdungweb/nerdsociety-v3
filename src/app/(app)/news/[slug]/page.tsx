import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    CalendarDaysIcon,
    MapPinIcon,
    ClockIcon,
    EyeIcon,
} from '@heroicons/react/24/outline'
import { Badge } from '@/shared/Badge'
import { HeaderNerd, FooterNerd } from '@/components/landing'
import PostGallery from './PostGallery'
import Breadcrumb from '@/components/Breadcrumb'
import TableOfContents from '@/components/TableOfContents'

interface PageProps {
    params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
    const post = await prisma.post.findUnique({
        where: { slug, status: 'PUBLISHED' },
        include: {
            author: { select: { name: true } },
        },
    })

    if (post) {
        // Increment view count
        await prisma.post.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
        })
    }

    return post
}

async function getRelatedPosts(postId: string, type: string) {
    return prisma.post.findMany({
        where: {
            id: { not: postId },
            type: type as 'NEWS' | 'EVENT',
            status: 'PUBLISHED',
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            publishedAt: true,
            type: true,
            featured: true,
        },
    })
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const post = await prisma.post.findUnique({
        where: { slug },
        select: { title: true, excerpt: true, thumbnail: true },
    })

    if (!post) {
        return { title: 'Không tìm thấy bài viết' }
    }

    return {
        title: post.title,
        description: post.excerpt || undefined,
        openGraph: {
            title: post.title,
            description: post.excerpt || undefined,
            images: post.thumbnail ? [post.thumbnail] : undefined,
        },
    }
}

export default async function PostDetailPage({ params }: PageProps) {
    const { slug } = await params
    const post = await getPost(slug)

    if (!post) {
        notFound()
    }

    const relatedPosts = await getRelatedPosts(post.id, post.type)
    const settings = await getSettings()

    // Breadcrumb structured data for SEO
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Trang chủ',
                item: process.env.NEXT_PUBLIC_SITE_URL || 'https://nerdsociety.vn',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Tin tức',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nerdsociety.vn'}/news`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.type === 'EVENT' ? 'Sự kiện' : 'Bài viết',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nerdsociety.vn'}/news?type=${post.type}`,
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: post.title,
            },
        ],
    }

    return (
        <>
            {/* Breadcrumb JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <HeaderNerd logoUrl={settings.siteLogo} logoLightUrl={settings.siteLogoLight} />
            <main className="pt-20">
                <article className="pb-16 lg:pb-24">
                    {/* Hero / Thumbnail */}
                    {post.thumbnail && (
                        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full">
                            <Image
                                src={post.thumbnail}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </div>
                    )}

                    <div className="container">
                        {/* Breadcrumb */}
                        <div className="py-6">
                            <Breadcrumb
                                items={[
                                    { label: 'Tin tức', href: '/news' },
                                    { label: post.type === 'EVENT' ? 'Sự kiện' : 'Bài viết', href: `/news?type=${post.type}` },
                                    { label: post.title },
                                ]}
                            />
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Main Content */}
                            <div className="flex-1 max-w-4xl">
                                {/* Header */}
                                <header className="mb-8">
                                    {/* Type badge */}
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <Badge color="primary">
                                            {post.type === 'EVENT' ? 'Sự kiện' : 'Tin tức'}
                                        </Badge>
                                        {post.featured && (
                                            <Badge color="featured">
                                                Nổi bật
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white leading-tight">
                                        {post.title}
                                    </h1>

                                    {/* Meta */}
                                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                                        <span>Bởi {post.author.name}</span>
                                        <span>•</span>
                                        {post.publishedAt && (
                                            <span>
                                                {format(new Date(post.publishedAt), 'dd MMMM yyyy', { locale: vi })}
                                            </span>
                                        )}
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <EyeIcon className="size-4" />
                                            {post.viewCount} lượt xem
                                        </div>
                                    </div>

                                    {/* Event info */}
                                    {post.type === 'EVENT' && post.eventDate && (
                                        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                            <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-3">
                                                Thông tin sự kiện
                                            </h3>
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                                                    <CalendarDaysIcon className="size-5" />
                                                    {format(new Date(post.eventDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
                                                </div>
                                                {post.eventTime && (
                                                    <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                                                        <ClockIcon className="size-5" />
                                                        {post.eventTime}
                                                    </div>
                                                )}
                                                {post.eventLocation && (
                                                    <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                                                        <MapPinIcon className="size-5" />
                                                        {post.eventLocation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </header>

                                {/* Gallery */}
                                {post.images && post.images.length > 0 && (
                                    <div className="mb-8">
                                        <PostGallery images={post.images} />
                                    </div>
                                )}

                                {/* Content */}
                                <div
                                    id="post-content"
                                    className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary-600 dark:prose-a:text-primary-400"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>

                            {/* Sidebar - Table of Contents */}
                            <aside className="hidden lg:block w-72 flex-shrink-0">
                                <div className="sticky top-24">
                                    <TableOfContents contentSelector="#post-content" />
                                </div>
                            </aside>
                        </div>

                        {/* Related posts */}
                        {relatedPosts.length > 0 && (
                            <div className="mt-16 pt-16 border-t border-neutral-200 dark:border-neutral-800">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">
                                    Bài viết liên quan
                                </h2>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {relatedPosts.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/news/${related.slug}`}
                                            className="group block"
                                        >
                                            <article className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                                {/* Thumbnail */}
                                                <div className="relative aspect-[16/10] overflow-hidden">
                                                    {related.thumbnail ? (
                                                        <Image
                                                            src={related.thumbnail}
                                                            alt={related.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800" />
                                                    )}

                                                    {/* Type badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <Badge color="primary">
                                                            {related.type === 'EVENT' ? 'Sự kiện' : 'Tin tức'}
                                                        </Badge>
                                                    </div>

                                                    {related.featured && (
                                                        <div className="absolute top-3 right-3">
                                                            <Badge color="featured">Nổi bật</Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 transition-colors">
                                                        {related.title}
                                                    </h3>

                                                    {related.publishedAt && (
                                                        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between text-sm">
                                                            <span className="text-neutral-500 dark:text-neutral-400">
                                                                {format(new Date(related.publishedAt), 'dd \'thg\' MM yyyy', { locale: vi })}
                                                            </span>
                                                            <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                                                                Đọc thêm →
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            </main>
            <FooterNerd logoUrl={settings.siteLogoLight || settings.siteLogo} />
        </>
    )
}
