'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    CalendarDaysIcon,
    EyeIcon,
    PencilIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    NewspaperIcon,
    StarIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import DeletePostButton from './DeletePostButton'
import { usePermissions } from '@/contexts/PermissionsContext'

interface Post {
    id: string
    title: string
    slug: string
    type: string
    status: string
    thumbnail: string | null
    viewCount: number
    featured: boolean
    createdAt: string
    publishedAt: string | null
    author: { name: string | null }
}

const typeLabels: Record<string, { label: string; color: string }> = {
    NEWS: { label: 'Tin tức', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
    EVENT: { label: 'Sự kiện', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' },
}

const statusLabels: Record<string, { label: string; color: string; dot: string }> = {
    DRAFT: { label: 'Bản nháp', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-500' },
    PUBLISHED: { label: 'Đã xuất bản', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800', dot: 'bg-emerald-500' },
    ARCHIVED: { label: 'Lưu trữ', color: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700', dot: 'bg-neutral-400' },
}

const ITEMS_PER_PAGE = 10

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)

    // Permission check
    const { hasPermission } = usePermissions()
    const canManagePosts = hasPermission('canManagePosts')

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/admin/posts?limit=1000')
            if (res.ok) {
                const data = await res.json()
                const postsArray = data.posts || []
                setPosts(postsArray)
                setFilteredPosts(postsArray)
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = useCallback(() => {
        let result = [...posts]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.author.name?.toLowerCase().includes(query)
            )
        }

        if (typeFilter !== 'ALL') {
            result = result.filter(p => p.type === typeFilter)
        }

        if (statusFilter !== 'ALL') {
            result = result.filter(p => p.status === statusFilter)
        }

        setFilteredPosts(result)
        setCurrentPage(1)
    }, [posts, searchQuery, typeFilter, statusFilter])

    useEffect(() => {
        applyFilters()
    }, [applyFilters])

    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'PUBLISHED').length,
        draft: posts.filter(p => p.status === 'DRAFT').length,
        featured: posts.filter(p => p.featured).length,
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-neutral-200 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-96 bg-neutral-200 rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Tin tức & Sự kiện</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Tạo và quản lý các bài viết, sự kiện • {posts.length} bài viết
                    </p>
                </div>
                {canManagePosts && (
                    <Link
                        href="/admin/posts/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl"
                    >
                        <PlusIcon className="size-5" />
                        Thêm bài viết
                    </Link>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white border border-neutral-200 p-4 dark:bg-neutral-900 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <NewspaperIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Tổng bài viết</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white border border-neutral-200 p-4 dark:bg-neutral-900 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <EyeIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.published}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Đã xuất bản</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white border border-neutral-200 p-4 dark:bg-neutral-900 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <PencilIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.draft}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Bản nháp</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-white border border-neutral-200 p-4 dark:bg-neutral-900 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                            <StarIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.featured}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Nổi bật</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-xl p-4 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tiêu đề, tác giả..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <FunnelIcon className="size-5 text-neutral-400" />
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="rounded-xl border border-neutral-300 pl-4 pr-8 py-2.5 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    >
                        <option value="ALL">Tất cả loại</option>
                        <option value="NEWS">Tin tức</option>
                        <option value="EVENT">Sự kiện</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-neutral-300 pl-4 pr-8 py-2.5 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PUBLISHED">Đã xuất bản</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="ARCHIVED">Lưu trữ</option>
                    </select>
                    {(typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                        <button
                            onClick={() => { setTypeFilter('ALL'); setStatusFilter('ALL'); }}
                            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Posts Table */}
            <div className="overflow-hidden rounded-xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                {paginatedPosts.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-medium uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-neutral-700 dark:text-neutral-400">
                                        <th className="px-6 py-4">Bài viết</th>
                                        <th className="px-6 py-4">Loại</th>
                                        <th className="px-6 py-4">Trạng thái</th>
                                        <th className="px-6 py-4">Lượt xem</th>
                                        <th className="px-6 py-4">Ngày tạo</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {paginatedPosts.map((post) => (
                                        <tr key={post.id} className="text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative size-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 dark:bg-neutral-800">
                                                        {post.thumbnail ? (
                                                            <Image
                                                                src={post.thumbnail}
                                                                alt=""
                                                                fill
                                                                className="object-cover"
                                                                sizes="56px"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <CalendarDaysIcon className="size-6 text-neutral-400" />
                                                            </div>
                                                        )}
                                                        {post.featured && (
                                                            <div className="absolute top-1 right-1 size-5 rounded-full bg-rose-500 flex items-center justify-center">
                                                                <StarIcon className="size-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/admin/posts/${post.id}/edit`}
                                                            className="font-medium text-neutral-900 hover:text-primary-600 line-clamp-1 dark:text-white dark:hover:text-primary-400"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                            {post.author.name || 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${typeLabels[post.type].color}`}>
                                                    {typeLabels[post.type].label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusLabels[post.status].color}`}>
                                                    <span className={`size-1.5 rounded-full ${statusLabels[post.status].dot}`} />
                                                    {statusLabels[post.status].label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                                                    <EyeIcon className="size-4" />
                                                    <span className="font-medium">{post.viewCount.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                                                {format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/news/${post.slug}`}
                                                        target="_blank"
                                                        className="flex size-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                                        title="Xem bài viết"
                                                    >
                                                        <EyeIcon className="size-4" />
                                                    </Link>
                                                    {canManagePosts && (
                                                        <>
                                                            <Link
                                                                href={`/admin/posts/${post.id}/edit`}
                                                                className="flex size-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <PencilIcon className="size-4" />
                                                            </Link>
                                                            <DeletePostButton postId={post.id} postTitle={post.title} />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)} của {filteredPosts.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronLeftIcon className="size-4" />
                                    </button>
                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                        const page = i + 1
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(page)}
                                                className={`size-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    })}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRightIcon className="size-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <NewspaperIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                        <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                            {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL' ? 'Không tìm thấy kết quả' : 'Chưa có bài viết nào'}
                        </p>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL' ? 'Thử thay đổi bộ lọc' : 'Hãy tạo bài viết đầu tiên!'}
                        </p>
                        {!searchQuery && typeFilter === 'ALL' && statusFilter === 'ALL' && (
                            <Link
                                href="/admin/posts/new"
                                className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
                            >
                                <PlusIcon className="size-5" />
                                Thêm bài viết
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
