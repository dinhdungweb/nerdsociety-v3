'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
    PlusIcon,
    BanknotesIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline'
import BookingDetailModal from '@/components/admin/bookings/BookingDetailModal'
import CreateBookingModal from '@/components/admin/bookings/CreateBookingModal'
import BookingCalendarView from '@/components/admin/bookings/BookingCalendarView'
import { TableCellsIcon, CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import useSWR from 'swr'
import PageGuard from '@/components/admin/PageGuard'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Room {
    id: string
    name: string
    type: string
    locationId: string
}

interface Location {
    id: string
    name: string
}

interface Booking {
    id: string
    bookingCode: string
    date: string
    startTime: string
    endTime: string
    estimatedAmount: number
    depositAmount: number
    depositStatus: string
    depositPaidAt: string | null
    status: string
    user: { name: string | null; email: string; phone: string | null }
    customerName: string
    customerPhone: string
    customerEmail: string | null
    guests: number
    location: { name: string }
    room: { name: string; type: string } | null
    // ... other fields if needed for logic but table uses these
    actualStartTime: string | null
    actualEndTime: string | null
    actualAmount: number | null
    remainingAmount: number | null
    nerdCoinIssued: number
    note: string | null
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    IN_PROGRESS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    COMPLETED: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    NO_SHOW: 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-500 dark:border-neutral-700',
}

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ cọc',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang sử dụng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
}

const statusDots: Record<string, string> = {
    PENDING: 'bg-amber-500',
    CONFIRMED: 'bg-blue-500',
    IN_PROGRESS: 'bg-emerald-500',
    COMPLETED: 'bg-neutral-500',
    CANCELLED: 'bg-red-500',
    NO_SHOW: 'bg-neutral-400',
}

const ITEMS_PER_PAGE = 10

function BookingsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [bookings, setBookings] = useState<Booking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [currentPage, setCurrentPage] = useState(1)

    // View mode
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [rooms, setRooms] = useState<Room[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [selectedLocation, setSelectedLocation] = useState<string>('')

    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    // 1. Fetch bookings using SWR
    const { data: bookingsData, error: bookingsError, mutate: mutateBookings, isValidating } = useSWR<Booking[]>(
        '/api/admin/bookings',
        fetcher,
        {
            refreshInterval: 60000, // Tự động làm mới mỗi phút
            revalidateOnFocus: true
        }
    )

    // 2. Fetch rooms
    const { data: roomsData } = useSWR<Room[]>('/api/admin/rooms', fetcher)

    // 3. Fetch locations
    const { data: locationsData } = useSWR<Location[]>('/api/admin/locations', fetcher)

    useEffect(() => {
        if (bookingsData) {
            setBookings(bookingsData)
            setFilteredBookings(bookingsData)
            setLoading(false)
        }
    }, [bookingsData])

    useEffect(() => {
        if (roomsData) setRooms(roomsData)
    }, [roomsData])

    useEffect(() => {
        if (locationsData) {
            setLocations(locationsData)
            if (locationsData.length > 0 && !selectedLocation) {
                setSelectedLocation(locationsData[0].id)
            }
        }
    }, [locationsData, selectedLocation])


    const applyFilters = useCallback(() => {
        let result = [...bookings]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(b =>
                b.bookingCode.toLowerCase().includes(query) ||
                (b.customerName && b.customerName.toLowerCase().includes(query)) ||
                (b.user?.name && b.user.name.toLowerCase().includes(query)) ||
                (b.customerPhone && b.customerPhone.includes(query)) ||
                (b.user?.phone && b.user.phone.includes(query)) ||
                (b.customerEmail && b.customerEmail.toLowerCase().includes(query)) ||
                (b.user?.email && b.user.email.toLowerCase().includes(query))
            )
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            result = result.filter(b => b.status === statusFilter)
        }

        setFilteredBookings(result)
        setCurrentPage(1)
    }, [bookings, searchQuery, statusFilter])

    useEffect(() => {
        applyFilters()
    }, [applyFilters])

    // Auto-open modal from URL query param (e.g., from notification click)
    useEffect(() => {
        const bookingId = searchParams.get('id')
        if (bookingId && bookings.length > 0) {
            const booking = bookings.find(b => b.id === bookingId)
            if (booking) {
                setSelectedBooking(booking)
                setDetailModalOpen(true)
                // Clear the query param after opening
                router.replace('/admin/bookings', { scroll: false })
            }
        }
    }, [searchParams, bookings, router])

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    // Stats
    const stats = {
        pending: bookings.filter(b => b.status === 'PENDING').length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        inProgress: bookings.filter(b => b.status === 'IN_PROGRESS').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    }

    const handleViewDetail = (booking: Booking) => {
        setSelectedBooking(booking)
        setDetailModalOpen(true)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="grid gap-4 sm:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-neutral-200 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-96 bg-neutral-200 rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Quản lý Booking</h1>
                        {isValidating && (
                            <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-medium text-primary-600 animate-pulse dark:bg-primary-900/20 dark:text-primary-400">
                                <ArrowPathIcon className="size-3 animate-spin" />
                                Đang đồng bộ...
                            </div>
                        )}
                    </div>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Xem và quản lý tất cả đặt lịch • {bookings.length} booking
                    </p>
                </div>

                {/* Desktop: All buttons in a row */}
                <div className="hidden sm:flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${viewMode === 'calendar'
                                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                                }`}
                        >
                            <CalendarIcon className="size-4" />
                            Lịch
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${viewMode === 'table'
                                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                                }`}
                        >
                            <TableCellsIcon className="size-4" />
                            Bảng
                        </button>
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button
                            className="cursor-pointer flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            <ArrowDownTrayIcon className="size-5" />
                            Export
                        </button>
                        <div className="absolute right-0 top-full z-20 mt-1 hidden w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg group-hover:block dark:border-neutral-700 dark:bg-neutral-800">
                            <a
                                href="/api/admin/export?type=bookings"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <CalendarDaysIcon className="size-4" />
                                Xuất Bookings (CSV)
                            </a>
                            <a
                                href="/api/admin/export?type=revenue"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <BanknotesIcon className="size-4" />
                                Xuất Doanh thu (CSV)
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95"
                    >
                        <PlusIcon className="size-5" />
                        Tạo Booking mới
                    </button>
                </div>

                {/* Mobile: Buttons in separate row */}
                <div className="flex sm:hidden items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${viewMode === 'calendar'
                                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                                }`}
                        >
                            <CalendarIcon className="size-4" />
                            Lịch
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${viewMode === 'table'
                                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                                }`}
                        >
                            <TableCellsIcon className="size-4" />
                            Bảng
                        </button>
                    </div>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button
                            className="cursor-pointer flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            <ArrowDownTrayIcon className="size-5" />
                            Export
                        </button>
                        <div className="absolute left-0 top-full z-20 mt-1 hidden w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg group-hover:block dark:border-neutral-700 dark:bg-neutral-800">
                            <a
                                href="/api/admin/export?type=bookings"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <CalendarDaysIcon className="size-4" />
                                Xuất Bookings (CSV)
                            </a>
                            <a
                                href="/api/admin/export?type=revenue"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <BanknotesIcon className="size-4" />
                                Xuất Doanh thu (CSV)
                            </a>
                        </div>
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95"
                    >
                        <PlusIcon className="size-5" />
                        Tạo mới
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'PENDING' ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                            <ClockIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.pending}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Chờ xác nhận</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setStatusFilter('CONFIRMED')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'CONFIRMED' ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <CheckCircleIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.confirmed}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Đã xác nhận</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setStatusFilter('IN_PROGRESS')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'IN_PROGRESS' ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircleIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.inProgress}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Đang sử dụng</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setStatusFilter('CANCELLED')}
                    className={`group rounded-xl p-4 text-left transition-all border ${statusFilter === 'CANCELLED' ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <XCircleIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.cancelled}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Đã hủy</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <BookingCalendarView
                    bookings={bookings}
                    rooms={selectedLocation ? rooms.filter(r => r.locationId === selectedLocation) : rooms}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    onBookingClick={handleViewDetail}
                    locations={locations}
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                />
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-xl p-4 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo mã, tên, email, SĐT..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <FunnelIcon className="size-5 text-neutral-400" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="rounded-xl border border-neutral-300 pl-4 pr-8 py-2.5 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ cọc</option>
                                <option value="CONFIRMED">Đã xác nhận</option>
                                <option value="IN_PROGRESS">Đang sử dụng</option>
                                <option value="COMPLETED">Hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
                        {paginatedBookings.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                                <th className="px-6 py-4">Mã booking</th>
                                                <th className="px-6 py-4">Khách hàng</th>
                                                <th className="px-6 py-4">Phòng / Dịch vụ</th>
                                                <th className="px-6 py-4">Ngày/Giờ</th>
                                                <th className="px-6 py-4">Tổng tiền</th>
                                                <th className="px-6 py-4">Trạng thái</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                            {paginatedBookings.map((booking) => (
                                                <tr key={booking.id} className="text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                            {booking.bookingCode}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-neutral-900 dark:text-white">{booking.customerName || booking.user?.name}</p>
                                                            <p className="text-neutral-500 dark:text-neutral-400">{booking.customerPhone || booking.user?.phone || booking.customerEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                        <p className="font-medium">{booking.room?.name || 'Không xác định'}</p>
                                                        <p className="text-xs text-neutral-500">{booking.location.name}</p>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                                        <div>
                                                            <p>{new Date(booking.date).toLocaleDateString('vi-VN')}</p>
                                                            <p className="text-neutral-500 dark:text-neutral-400">{booking.startTime} - {booking.endTime}</p>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.estimatedAmount)}
                                                        {booking.depositStatus === 'PAID_CASH' && (
                                                            <span className="ml-2 text-xs font-normal text-emerald-600 block">Đã thu cọc</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[booking.status] || statusColors['PENDING']}`}>
                                                            <span className={`size-1.5 rounded-full ${statusDots[booking.status] || statusDots['PENDING']}`} />
                                                            {statusLabels[booking.status] || booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <button
                                                            onClick={() => handleViewDetail(booking)}
                                                            className="flex size-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                                                        >
                                                            <EyeIcon className="size-5" />
                                                        </button>
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
                                            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} của {filteredBookings.length}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                            >
                                                <ChevronLeftIcon className="size-4" />
                                            </button>
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`size-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                                                        ? 'bg-primary-600 text-white'
                                                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
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
                                <CalendarDaysIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                                <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                                    {searchQuery || statusFilter !== 'ALL' ? 'Không tìm thấy kết quả' : 'Chưa có booking nào'}
                                </p>
                                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                                    {searchQuery || statusFilter !== 'ALL' ? 'Thử thay đổi bộ lọc' : 'Các booking sẽ xuất hiện ở đây'}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            <CreateBookingModal
                open={createModalOpen}
                setOpen={setCreateModalOpen}
                onSuccess={() => mutateBookings()}
            />

            <BookingDetailModal
                open={detailModalOpen}
                setOpen={setDetailModalOpen}
                booking={selectedBooking}
                onRefresh={() => mutateBookings()}
            />
        </div>
    )
}

export default function BookingsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PageGuard requiredPermission="canViewBookings">
                <BookingsContent />
            </PageGuard>
        </Suspense>
    )
}
