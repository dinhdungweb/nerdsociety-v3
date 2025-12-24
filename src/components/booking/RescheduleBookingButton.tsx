'use client'

import { useState } from 'react'
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface RescheduleBookingButtonProps {
    bookingId: string
    bookingCode: string
    currentDate: string
    currentStartTime: string
    currentEndTime: string
    canReschedule: boolean
    minutesToStart: number
}

export default function RescheduleBookingButton({
    bookingId,
    bookingCode,
    currentDate,
    currentStartTime,
    currentEndTime,
    canReschedule,
    minutesToStart
}: RescheduleBookingButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [newDate, setNewDate] = useState('')
    const [newStartTime, setNewStartTime] = useState('')
    const [newEndTime, setNewEndTime] = useState('')
    const router = useRouter()

    // Get min date (today)
    const today = new Date().toISOString().split('T')[0]

    const handleReschedule = async () => {
        if (!newDate || !newStartTime || !newEndTime) {
            toast.error('Vui lòng chọn ngày và giờ mới')
            return
        }

        if (newStartTime >= newEndTime) {
            toast.error('Giờ kết thúc phải sau giờ bắt đầu')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/booking/${bookingId}/reschedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newDate, newStartTime, newEndTime }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra')
            }

            toast.success('Đổi lịch thành công!')
            setIsOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!canReschedule) {
        return (
            <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                {minutesToStart < 60
                    ? 'Không thể đổi lịch (dưới 60 phút trước giờ)'
                    : 'Không thể đổi lịch booking này'}
            </div>
        )
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:border-primary-900 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40"
            >
                <CalendarDaysIcon className="size-4" />
                Đổi lịch
            </button>

            {/* Reschedule Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400">
                            <CalendarDaysIcon className="size-6" />
                            <h3 className="text-lg font-semibold">Đổi lịch đặt phòng</h3>
                        </div>

                        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                            Booking <strong>#{bookingCode}</strong>
                        </p>

                        <div className="mt-4 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Lịch hiện tại</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {new Date(currentDate).toLocaleDateString('vi-VN')} • {currentStartTime} - {currentEndTime}
                            </p>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Ngày mới
                                </label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    min={today}
                                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Giờ bắt đầu
                                    </label>
                                    <input
                                        type="time"
                                        value={newStartTime}
                                        onChange={(e) => setNewStartTime(e.target.value)}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Giờ kết thúc
                                    </label>
                                    <input
                                        type="time"
                                        value={newEndTime}
                                        onChange={(e) => setNewEndTime(e.target.value)}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReschedule}
                                disabled={loading || !newDate || !newStartTime || !newEndTime}
                                className="flex-1 cursor-pointer rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận đổi lịch'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
