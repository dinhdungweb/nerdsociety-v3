import { Badge } from '@/shared/Badge'
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

export interface Post {
    id: string
    title: string
    slug: string
    type: 'NEWS' | 'EVENT'
    excerpt: string | null
    thumbnail: string | null
    publishedAt: string | null
    eventDate: string | null
    eventTime: string | null
    eventLocation: string | null
    featured: boolean
    author: { name: string } | null
}

export default function PostCard({ post }: { post: Post }) {
    return (
        <Link href={`/news/${post.slug}`} className="group block h-full w-full">
            <article className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    {post.thumbnail ? (
                        <Image
                            src={post.thumbnail}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
                            <CalendarDaysIcon className="size-12 text-primary-400" />
                        </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                        <Badge color="primary">
                            {post.type === 'EVENT' ? 'Sự kiện' : 'Tin tức'}
                        </Badge>
                    </div>

                    {post.featured && (
                        <div className="absolute top-3 right-3">
                            <Badge color="featured">Nổi bật</Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                        {/* Event info */}
                        {post.type === 'EVENT' && post.eventDate && (
                            <div className="flex flex-wrap gap-3 mb-3 text-sm text-neutral-500 dark:text-neutral-400">
                                <div className="flex items-center gap-1">
                                    <CalendarDaysIcon className="size-4" />
                                    {format(new Date(post.eventDate), 'dd/MM/yyyy', { locale: vi })}
                                </div>
                                {post.eventTime && (
                                    <div className="flex items-center gap-1">
                                        <ClockIcon className="size-4" />
                                        {post.eventTime}
                                    </div>
                                )}
                                {post.eventLocation && (
                                    <div className="flex items-center gap-1">
                                        <MapPinIcon className="size-4" />
                                        <span className="truncate max-w-[150px]">{post.eventLocation}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {post.title}
                        </h3>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
                                {post.excerpt}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400">
                            {post.publishedAt && format(new Date(post.publishedAt), 'dd MMM yyyy', { locale: vi })}
                        </span>
                        <span className="text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                            Đọc thêm →
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    )
}
