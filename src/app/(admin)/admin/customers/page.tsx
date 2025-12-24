'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    MagnifyingGlassIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarDaysIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline'
import NcModal from '@/shared/NcModal'

interface Customer {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
    createdAt: string
    _count: { bookings: number }
    bookings?: Booking[]
}

interface Booking {
    id: string
    bookingCode: string
    date: string
    startTime: string
    endTime: string
    status: string
    estimatedAmount: number
    room: { name: string }
    location: { name: string }
}

const ITEMS_PER_PAGE = 10

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ cọc',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang sử dụng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
}

const statusStyles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    COMPLETED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    NO_SHOW: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-500',
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'bookings'>('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/admin/customers')
            if (res.ok) {
                const data = await res.json()
                setCustomers(data)
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCustomerDetail = async (customerId: string) => {
        setLoadingDetail(true)
        try {
            const res = await fetch(`/api/admin/customers/${customerId}`)
            if (res.ok) {
                const data = await res.json()
                setSelectedCustomer(data)
            }
        } catch (error) {
            console.error('Error fetching customer detail:', error)
        } finally {
            setLoadingDetail(false)
        }
    }

    const openCustomerModal = (customer: Customer) => {
        setSelectedCustomer(customer)
        setIsModalOpen(true)
        fetchCustomerDetail(customer.id)
    }

    // Filter and sort customers
    const filteredCustomers = useMemo(() => {
        let result = customers.filter(customer => {
            const query = searchQuery.toLowerCase()
            return (
                customer.name.toLowerCase().includes(query) ||
                customer.email.toLowerCase().includes(query) ||
                (customer.phone && customer.phone.includes(query))
            )
        })

        // Sort
        result.sort((a, b) => {
            let comparison = 0
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name)
                    break
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    break
                case 'bookings':
                    comparison = a._count.bookings - b._count.bookings
                    break
            }
            return sortOrder === 'desc' ? -comparison : comparison
        })

        return result
    }, [customers, searchQuery, sortBy, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-10 w-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4 border-b border-neutral-100 p-4 dark:border-neutral-800">
                            <div className="size-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                                <div className="h-3 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Khách hàng</h1>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        {filteredCustomers.length} khách hàng
                    </p>
                </div>

                {/* Desktop: Search and Actions */}
                <div className="hidden sm:flex items-center gap-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Tìm tên, email, SĐT..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-64 rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                <XMarkIcon className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={e => {
                            const [field, order] = e.target.value.split('-')
                            setSortBy(field as any)
                            setSortOrder(order as any)
                        }}
                        className="rounded-xl border border-neutral-200 bg-white py-2.5 pl-3 pr-8 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                        <option value="createdAt-desc">Mới nhất</option>
                        <option value="createdAt-asc">Cũ nhất</option>
                        <option value="name-asc">Tên A-Z</option>
                        <option value="name-desc">Tên Z-A</option>
                        <option value="bookings-desc">Booking nhiều nhất</option>
                    </select>

                    {/* Export Button */}
                    <a
                        href="/api/admin/export?type=customers"
                        className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                        <ArrowDownTrayIcon className="size-5" />
                        Export
                    </a>
                </div>

                {/* Mobile: Actions row */}
                <div className="flex sm:hidden items-center gap-2">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                <XMarkIcon className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={e => {
                            const [field, order] = e.target.value.split('-')
                            setSortBy(field as any)
                            setSortOrder(order as any)
                        }}
                        className="rounded-xl border border-neutral-200 bg-white py-2.5 pl-3 pr-8 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                        <option value="createdAt-desc">Mới nhất</option>
                        <option value="createdAt-asc">Cũ nhất</option>
                        <option value="name-asc">A-Z</option>
                        <option value="name-desc">Z-A</option>
                        <option value="bookings-desc">Nhiều booking</option>
                    </select>

                    {/* Export Button */}
                    <a
                        href="/api/admin/export?type=customers"
                        className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    >
                        <ArrowDownTrayIcon className="size-5" />
                    </a>
                </div>
            </div>

            {/* Customers List - Desktop */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                {paginatedCustomers.length > 0 ? (
                    <>
                        {/* Table Header */}
                        <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-3 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400 grid grid-cols-12">
                            <div className="col-span-4">Khách hàng</div>
                            <div className="col-span-3">Email</div>
                            <div className="col-span-2">Số điện thoại</div>
                            <div className="col-span-1 text-center">Booking</div>
                            <div className="col-span-2 text-right">Ngày tham gia</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {paginatedCustomers.map(customer => (
                                <div
                                    key={customer.id}
                                    onClick={() => openCustomerModal(customer)}
                                    className="grid cursor-pointer grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                >
                                    {/* Customer Info */}
                                    <div className="col-span-4 flex items-center gap-3">
                                        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                                            {customer.avatar ? (
                                                <img src={customer.avatar} alt="" className="size-10 rounded-full object-cover" />
                                            ) : (
                                                customer.name[0]?.toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                            {customer.name}
                                        </span>
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        {customer.email}
                                    </div>

                                    {/* Phone */}
                                    <div className="col-span-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        {customer.phone || '-'}
                                    </div>

                                    {/* Bookings Count */}
                                    <div className="col-span-1 text-center">
                                        <span className="inline-flex rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                            {customer._count.bookings}
                                        </span>
                                    </div>

                                    {/* Created Date */}
                                    <div className="col-span-2 text-right text-sm text-neutral-500 dark:text-neutral-400">
                                        {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="px-6 py-16 text-center">
                        <UserIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                        <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                            {searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'}
                        </p>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            {searchQuery ? 'Thử tìm với từ khóa khác' : 'Khách hàng sẽ xuất hiện ở đây sau khi đăng ký'}
                        </p>
                    </div>
                )}
            </div>

            {/* Customers List - Mobile Cards */}
            <div className="md:hidden space-y-3">
                {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map(customer => (
                        <div
                            key={customer.id}
                            onClick={() => openCustomerModal(customer)}
                            className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                                        {customer.avatar ? (
                                            <img src={customer.avatar} alt="" className="size-10 rounded-full object-cover" />
                                        ) : (
                                            customer.name[0]?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">{customer.name}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{customer.email}</p>
                                    </div>
                                </div>
                                <span className="inline-flex rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                    {customer._count.bookings} booking
                                </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                <div className="flex items-center gap-4 text-sm">
                                    {customer.phone && (
                                        <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                                            <PhoneIcon className="size-4" />
                                            {customer.phone}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <UserIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                        <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                            {searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'}
                        </p>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            {searchQuery ? 'Thử tìm với từ khóa khác' : 'Khách hàng sẽ xuất hiện ở đây sau khi đăng ký'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} / {filteredCustomers.length} khách hàng
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        >
                            <ChevronLeftIcon className="size-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number
                            if (totalPages <= 5) {
                                pageNum = i + 1
                            } else if (currentPage <= 3) {
                                pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                            } else {
                                pageNum = currentPage - 2 + i
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                        ? 'bg-primary-600 text-white'
                                        : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        >
                            <ChevronRightIcon className="size-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Customer Detail Modal */}
            <NcModal
                isOpenProp={isModalOpen}
                onCloseModal={() => setIsModalOpen(false)}
                modalTitle="Thông tin khách hàng"
                renderTrigger={() => null}
                renderContent={() => (
                    <div className="space-y-6">
                        {selectedCustomer && (
                            <>
                                {/* Customer Header */}
                                <div className="flex items-center gap-4">
                                    <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-2xl font-bold text-white">
                                        {selectedCustomer.avatar ? (
                                            <img src={selectedCustomer.avatar} alt="" className="size-16 rounded-full object-cover" />
                                        ) : (
                                            selectedCustomer.name[0]?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                            {selectedCustomer.name}
                                        </h3>
                                        <p className="text-neutral-500 dark:text-neutral-400">{selectedCustomer.email}</p>
                                    </div>
                                </div>

                                {/* Customer Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Số điện thoại</p>
                                        <p className="mt-1 font-medium text-neutral-900 dark:text-white">
                                            {selectedCustomer.phone || 'Chưa cập nhật'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Tổng booking</p>
                                        <p className="mt-1 font-medium text-neutral-900 dark:text-white">
                                            {selectedCustomer._count.bookings} lần
                                        </p>
                                    </div>
                                    <div className="col-span-2 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Ngày tham gia</p>
                                        <p className="mt-1 font-medium text-neutral-900 dark:text-white">
                                            {new Date(selectedCustomer.createdAt).toLocaleDateString('vi-VN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Booking History */}
                                <div>
                                    <h4 className="mb-3 font-semibold text-neutral-900 dark:text-white">
                                        Lịch sử đặt phòng
                                    </h4>
                                    {loadingDetail ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-16 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                                            ))}
                                        </div>
                                    ) : selectedCustomer.bookings && selectedCustomer.bookings.length > 0 ? (
                                        <div className="max-h-64 space-y-2 overflow-y-auto">
                                            {selectedCustomer.bookings.map(booking => (
                                                <div
                                                    key={booking.id}
                                                    className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <CalendarDaysIcon className="size-5 text-neutral-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                {booking.bookingCode}
                                                            </p>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                {new Date(booking.date).toLocaleDateString('vi-VN')} • {booking.startTime} - {booking.endTime}
                                                            </p>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                {booking.room.name} • {booking.location.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[booking.status]}`}>
                                                            {statusLabels[booking.status]}
                                                        </span>
                                                        <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                                            {new Intl.NumberFormat('vi-VN').format(booking.estimatedAmount)}đ
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-neutral-50 py-8 text-center dark:bg-neutral-800">
                                            <CalendarDaysIcon className="mx-auto size-8 text-neutral-300 dark:text-neutral-600" />
                                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                Chưa có booking nào
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            />
        </div>
    )
}
