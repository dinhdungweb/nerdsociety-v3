'use client'

import { CalendarDaysIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import React, { useMemo, useState } from 'react'

interface Booking {
    id: string
    bookingCode: string
    date: string
    startTime: string
    endTime: string
    status: string
    customerName: string
    customerPhone: string
    room: { name: string; type: string } | null
    location: { name: string }
    estimatedAmount: number
}

interface Room {
    id: string
    name: string
    type: string
}

interface Location {
    id: string
    name: string
}

interface BookingCalendarViewProps {
    bookings: any[]
    rooms: Room[]
    selectedDate: Date
    onDateChange: (date: Date) => void
    onBookingClick: (booking: any) => void
    locations: Location[]
    selectedLocation: string
    onLocationChange: (locationId: string) => void
}

const statusColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-400', accent: 'bg-amber-500' },
    CONFIRMED: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-400', accent: 'bg-blue-500' },
    IN_PROGRESS: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400', accent: 'bg-emerald-500' },
    COMPLETED: { bg: 'bg-neutral-100 dark:bg-neutral-800', border: 'border-neutral-200 dark:border-neutral-700', text: 'text-neutral-600 dark:text-neutral-400', accent: 'bg-neutral-500' },
    CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-700', text: 'text-red-700 dark:text-red-400', accent: 'bg-red-500' },
    NO_SHOW: { bg: 'bg-neutral-100 dark:bg-neutral-800', border: 'border-neutral-200 dark:border-neutral-700', text: 'text-neutral-500 dark:text-neutral-500', accent: 'bg-neutral-500' },
}

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ cọc',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang sử dụng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
}

// Generate time slots from 08:00 to 22:00
function generateTimeSlots(): string[] {
    const slots: string[] = []
    for (let hour = 8; hour <= 22; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
}

// Parse time string to minutes from midnight
function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

export default function BookingCalendarView({
    bookings,
    rooms,
    selectedDate,
    onDateChange,
    onBookingClick,
    locations,
    selectedLocation,
    onLocationChange,
}: BookingCalendarViewProps) {
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
    const [showDatePicker, setShowDatePicker] = useState(false)
    const timeSlots = useMemo(() => generateTimeSlots(), [])

    // Get week dates
    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday
        return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }, [selectedDate])

    // Filter bookings for selected date (exclude CANCELLED)
    const dayBookings = useMemo(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        return bookings.filter(b => {
            if (b.status === 'CANCELLED') return false
            const bookingDate = new Date(b.date)
            return format(bookingDate, 'yyyy-MM-dd') === dateStr
        })
    }, [bookings, selectedDate])

    // Get bookings for a specific date (for week view)
    const getBookingsForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return bookings.filter(b => {
            if (b.status === 'CANCELLED') return false
            const bookingDate = new Date(b.date)
            return format(bookingDate, 'yyyy-MM-dd') === dateStr
        })
    }

    // Get booking duration in slots
    const getBookingDuration = (booking: Booking): number => {
        const startMinutes = timeToMinutes(booking.startTime)
        const endMinutes = timeToMinutes(booking.endTime)
        return (endMinutes - startMinutes) / 60
    }

    // Navigate dates
    const prevPeriod = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() - (viewMode === 'week' ? 7 : 1))
        onDateChange(newDate)
    }

    const nextPeriod = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + (viewMode === 'week' ? 7 : 1))
        onDateChange(newDate)
    }

    const goToToday = () => {
        onDateChange(new Date())
    }

    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

    // Generate mini calendar for date picker
    const generateMonthDays = () => {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0

        const days: (Date | null)[] = []
        for (let i = 0; i < startOffset; i++) {
            days.push(null)
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d))
        }
        return days
    }

    return (
        <div className="space-y-4">
            {/* Date Navigation */}
            <div className="flex flex-col gap-4 rounded-xl bg-white p-4 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={prevPeriod}
                        className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                        <ChevronLeftIcon className="size-5" />
                    </button>

                    {/* Date Display / Picker Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <CalendarIcon className="size-5 text-neutral-500" />
                            <div className="text-left">
                                {viewMode === 'day' ? (
                                    <>
                                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                            {format(selectedDate, 'EEEE', { locale: vi })}
                                        </p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {format(selectedDate, 'dd MMMM yyyy', { locale: vi })}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                            Tuần {format(weekDates[0], 'dd/MM')} - {format(weekDates[6], 'dd/MM')}
                                        </p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {format(selectedDate, 'MMMM yyyy', { locale: vi })}
                                        </p>
                                    </>
                                )}
                            </div>
                        </button>

                        {/* Date Picker Dropdown */}
                        {showDatePicker && (
                            <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl bg-white p-4 shadow-xl border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => {
                                            const newDate = new Date(selectedDate)
                                            newDate.setMonth(newDate.getMonth() - 1)
                                            onDateChange(newDate)
                                        }}
                                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronLeftIcon className="size-4" />
                                    </button>
                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                        {format(selectedDate, 'MMMM yyyy', { locale: vi })}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newDate = new Date(selectedDate)
                                            newDate.setMonth(newDate.getMonth() + 1)
                                            onDateChange(newDate)
                                        }}
                                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRightIcon className="size-4" />
                                    </button>
                                </div>

                                {/* Weekday Headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                                        <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {generateMonthDays().map((day, i) => (
                                        <button
                                            key={i}
                                            disabled={!day}
                                            onClick={() => {
                                                if (day) {
                                                    onDateChange(day)
                                                    setShowDatePicker(false)
                                                }
                                            }}
                                            className={`size-8 rounded-lg text-sm transition-colors ${!day
                                                ? ''
                                                : isSameDay(day, selectedDate)
                                                    ? 'bg-primary-600 text-white'
                                                    : isSameDay(day, new Date())
                                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                                        : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                                                }`}
                                        >
                                            {day?.getDate()}
                                        </button>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">
                                    <button
                                        onClick={() => {
                                            onDateChange(new Date())
                                            setShowDatePicker(false)
                                        }}
                                        className="flex-1 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400"
                                    >
                                        Hôm nay
                                    </button>
                                    <button
                                        onClick={() => setShowDatePicker(false)}
                                        className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg dark:text-neutral-400 dark:hover:bg-neutral-800"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={nextPeriod}
                        className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                        <ChevronRightIcon className="size-5" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex rounded-lg border border-neutral-200 p-1 dark:border-neutral-700">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'day'
                                ? 'bg-primary-600 text-white'
                                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                }`}
                        >
                            Ngày
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'week'
                                ? 'bg-primary-600 text-white'
                                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                }`}
                        >
                            Tuần
                        </button>
                    </div>

                    {!isToday && (
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg dark:text-primary-400 dark:hover:bg-primary-900/20"
                        >
                            Hôm nay
                        </button>
                    )}

                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <CalendarDaysIcon className="size-5" />
                        <span>{viewMode === 'day' ? dayBookings.length : bookings.filter(b => b.status !== 'CANCELLED').length} booking</span>
                    </div>

                    {/* Location Filter */}
                    {locations.length > 0 && (
                        <select
                            value={selectedLocation}
                            onChange={(e) => onLocationChange(e.target.value)}
                            className="pl-3 pr-8 py-1.5 text-sm border border-neutral-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-white"
                        >
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
                {Object.entries(statusLabels).filter(([key]) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(key)).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className={`size-3 rounded ${statusColors[key]?.bg} border ${statusColors[key]?.border}`} />
                        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
                    </div>
                ))}
            </div>

            {/* DAY VIEW */}
            {viewMode === 'day' && (
                <div className="rounded-xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header Row */}
                            <div className="grid border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
                                style={{ gridTemplateColumns: `80px repeat(${rooms.length}, 1fr)` }}>
                                <div className="p-3 text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 flex items-center">
                                    <ClockIcon className="size-4 mr-1" />
                                    Giờ
                                </div>
                                {rooms.map(room => (
                                    <div key={room.id} className="p-3 text-center border-l border-neutral-200 dark:border-neutral-700">
                                        <p className="font-medium text-neutral-900 dark:text-white text-sm">{room.name}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {room.type === 'POD_MONO' ? 'Pod' : room.type === 'POD_MULTI' ? 'Pod Multi' : 'Meeting'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Time Slots */}
                            {timeSlots.map((timeSlot) => {
                                const slotStartMinutes = timeToMinutes(timeSlot)
                                const HOUR_HEIGHT = 80

                                return (
                                    <div
                                        key={timeSlot}
                                        className="grid border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                                        style={{ gridTemplateColumns: `80px repeat(${rooms.length}, 1fr)` }}
                                    >
                                        {/* Time Label */}
                                        <div className="p-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-start justify-center">
                                            {timeSlot}
                                        </div>

                                        {/* Room Cells */}
                                        {rooms.map(room => {
                                            const slotEndMinutes = slotStartMinutes + 60

                                            const booking = dayBookings.find(b => {
                                                if (b.room?.name !== room.name) return false
                                                const start = timeToMinutes(b.startTime)
                                                return start >= slotStartMinutes && start < slotEndMinutes
                                            })

                                            const duration = booking ? getBookingDuration(booking) : 0
                                            const colors = booking ? statusColors[booking.status] || statusColors.PENDING : null
                                            const startMinutes = booking ? timeToMinutes(booking.startTime) : 0
                                            const topOffset = ((startMinutes - slotStartMinutes) / 60) * HOUR_HEIGHT

                                            return (
                                                <div
                                                    key={room.id}
                                                    className="relative border-l border-neutral-100 dark:border-neutral-800"
                                                    style={{ minHeight: `${HOUR_HEIGHT}px` }}
                                                >
                                                    {booking && (
                                                        <button
                                                            onClick={() => onBookingClick(booking)}
                                                            className={`absolute inset-x-1 rounded shadow-sm text-left transition-all hover:shadow-md hover:scale-[1.02] z-10 overflow-hidden group flex flex-col ${colors?.bg} border border-transparent`}
                                                            style={{
                                                                height: `calc(${duration * HOUR_HEIGHT}px - 2px)`,
                                                                top: `${topOffset + 1}px`
                                                            }}
                                                        >
                                                            <div className={`absolute left-0 inset-y-0 w-1 ${colors?.accent}`} />
                                                            <div className="pl-3 pr-2 py-1.5 flex flex-col h-full justify-between">
                                                                <div>
                                                                    <p className={`text-xs font-semibold truncate leading-tight ${colors?.text}`}>
                                                                        {booking.customerName}
                                                                    </p>
                                                                    {(duration * HOUR_HEIGHT) > 20 && (
                                                                        <p className={`text-[10px] ${colors?.text} opacity-75 leading-tight mt-0.5`}>
                                                                            {booking.startTime} - {booking.endTime}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {(duration * HOUR_HEIGHT) > 40 && (
                                                                    <p className={`text-[10px] font-medium ${colors?.text} opacity-90 truncate mt-1`}>
                                                                        {statusLabels[booking.status]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === 'week' && (
                <div className="rounded-xl bg-white border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Header Row - Days */}
                            <div className="grid border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
                                style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
                                {weekDates.map((date, i) => {
                                    const isDateToday = isSameDay(date, new Date())
                                    const isSelected = isSameDay(date, selectedDate)
                                    const dateBookings = getBookingsForDate(date)

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                onDateChange(date)
                                                setViewMode('day')
                                            }}
                                            className={`p-3 text-center border-l first:border-l-0 border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                                }`}
                                        >
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {format(date, 'EEEE', { locale: vi })}
                                            </p>
                                            <p className={`text-lg font-bold mt-1 ${isDateToday
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : 'text-neutral-900 dark:text-white'
                                                }`}>
                                                {format(date, 'dd')}
                                            </p>
                                            {dateBookings.length > 0 && (
                                                <span className="inline-flex mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full dark:bg-primary-900/30 dark:text-primary-400">
                                                    {dateBookings.length}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Week Content - Show bookings per day */}
                            <div className="grid" style={{ gridTemplateColumns: `repeat(7, 1fr)` }}>
                                {weekDates.map((date, i) => {
                                    const dateBookings = getBookingsForDate(date).slice(0, 5) // Show max 5

                                    return (
                                        <div
                                            key={i}
                                            className="border-l first:border-l-0 border-neutral-200 dark:border-neutral-700 min-h-[200px] p-2 space-y-1"
                                        >
                                            {dateBookings.map(booking => {
                                                const colors = statusColors[booking.status] || statusColors.PENDING

                                                return (
                                                    <button
                                                        key={booking.id}
                                                        onClick={() => onBookingClick(booking)}
                                                        className={`w-full p-2 rounded text-left text-xs ${colors.bg} border ${colors.border} transition-colors hover:shadow-sm`}
                                                    >
                                                        <p className={`font-semibold truncate ${colors.text}`}>
                                                            {booking.startTime} - {booking.room?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-neutral-600 dark:text-neutral-400 truncate">
                                                            {booking.customerName}
                                                        </p>
                                                    </button>
                                                )
                                            })}
                                            {getBookingsForDate(date).length > 5 && (
                                                <p className="text-xs text-center text-neutral-500 py-1">
                                                    +{getBookingsForDate(date).length - 5} khác
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {viewMode === 'day' && dayBookings.length === 0 && (
                <div className="text-center py-8">
                    <CalendarDaysIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                    <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                        Không có booking
                    </p>
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                        Ngày {format(selectedDate, 'dd/MM/yyyy')} chưa có đặt lịch nào
                    </p>
                </div>
            )}
        </div>
    )
}
