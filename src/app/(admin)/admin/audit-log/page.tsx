'use client'

import { useState, useEffect } from 'react'
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    UserIcon,
    DocumentTextIcon,
    PencilIcon,
    TrashIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftOnRectangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface AuditLog {
    id: string
    userId: string
    userName: string
    action: string
    resource: string
    resourceId: string | null
    details: string | null
    ipAddress: string | null
    createdAt: string
}

const actionLabels: Record<string, { label: string; color: string; icon: any }> = {
    CREATE: { label: 'Tạo mới', color: 'bg-green-100 text-green-700', icon: DocumentTextIcon },
    UPDATE: { label: 'Cập nhật', color: 'bg-blue-100 text-blue-700', icon: PencilIcon },
    DELETE: { label: 'Xóa', color: 'bg-red-100 text-red-700', icon: TrashIcon },
    LOGIN: { label: 'Đăng nhập', color: 'bg-purple-100 text-purple-700', icon: ArrowRightOnRectangleIcon },
    LOGOUT: { label: 'Đăng xuất', color: 'bg-neutral-100 text-neutral-700', icon: ArrowLeftOnRectangleIcon },
    CHECK_IN: { label: 'Check-in', color: 'bg-emerald-100 text-emerald-700', icon: ArrowRightOnRectangleIcon },
    CHECK_OUT: { label: 'Check-out', color: 'bg-orange-100 text-orange-700', icon: ArrowLeftOnRectangleIcon },
    CONFIRM_PAYMENT: { label: 'Xác nhận TT', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
    CANCEL: { label: 'Hủy', color: 'bg-red-100 text-red-700', icon: XCircleIcon },
    VIEW: { label: 'Xem', color: 'bg-neutral-100 text-neutral-600', icon: EyeIcon },
}

const resourceLabels: Record<string, string> = {
    booking: 'Booking',
    user: 'Người dùng',
    post: 'Bài viết',
    room: 'Phòng',
    location: 'Cơ sở',
    service: 'Dịch vụ',
    auth: 'Xác thực',
    payment: 'Thanh toán',
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState('')
    const [actionFilter, setActionFilter] = useState('')
    const [resourceFilter, setResourceFilter] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '30',
            })
            if (search) params.set('search', search)
            if (actionFilter) params.set('action', actionFilter)
            if (resourceFilter) params.set('resource', resourceFilter)

            const res = await fetch(`/api/admin/audit-log?${params}`)
            const data = await res.json()

            if (res.ok) {
                setLogs(data.logs)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [page, actionFilter, resourceFilter])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchLogs()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Lịch sử thao tác
                </h1>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                    <ArrowPathIcon className="size-4" />
                    Làm mới
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex flex-wrap gap-4">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-4 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                        >
                            Tìm
                        </button>
                    </form>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${showFilters
                                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20'
                                : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300'
                            }`}
                    >
                        <FunnelIcon className="size-4" />
                        Bộ lọc
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 flex flex-wrap gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                        <select
                            value={actionFilter}
                            onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                            <option value="">Tất cả hành động</option>
                            {Object.entries(actionLabels).map(([key, { label }]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <select
                            value={resourceFilter}
                            onChange={(e) => { setResourceFilter(e.target.value); setPage(1) }}
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                            <option value="">Tất cả đối tượng</option>
                            {Object.entries(resourceLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Log Table */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="size-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                    </div>
                ) : logs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Thời gian</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Người thực hiện</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Hành động</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Đối tượng</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Chi tiết</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {logs.map((log) => {
                                    const actionInfo = actionLabels[log.action] || { label: log.action, color: 'bg-neutral-100 text-neutral-700', icon: DocumentTextIcon }
                                    const IconComponent = actionInfo.icon
                                    let details = null
                                    try {
                                        details = log.details ? JSON.parse(log.details) : null
                                    } catch { }

                                    return (
                                        <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                                                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                        <UserIcon className="size-4 text-neutral-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                        {log.userName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${actionInfo.color}`}>
                                                    <IconComponent className="size-3" />
                                                    {actionInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                                                {resourceLabels[log.resource] || log.resource}
                                                {log.resourceId && (
                                                    <span className="ml-1 text-neutral-400">#{log.resourceId.slice(-6)}</span>
                                                )}
                                            </td>
                                            <td className="max-w-xs truncate px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                                                {details ? (
                                                    <span title={JSON.stringify(details, null, 2)}>
                                                        {details.bookingCode || details.name || details.email || JSON.stringify(details).slice(0, 50)}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-400">
                                                {log.ipAddress || '—'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-neutral-500">
                        Không có dữ liệu
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
                        <span className="text-sm text-neutral-500">
                            Trang {page} / {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-lg border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-neutral-700"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
