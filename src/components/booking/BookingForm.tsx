'use client'

import { Button } from '@/shared/Button'
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline'
import { addDays, format, isSameDay, setHours, setMinutes } from 'date-fns'
import { vi } from 'date-fns/locale'
import DatePicker, { registerLocale } from 'react-datepicker'

registerLocale('vi', vi)

interface BookingFormProps {
    selectedDate: Date | null
    selectedTime: string
    onDateChange: (date: Date | null) => void
    onTimeChange: (time: string) => void
    onSubmit: () => void
    loading?: boolean
}

// Generate time slots from 7:00 to 22:00
const timeSlots = Array.from({ length: 31 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7
    const minute = i % 2 === 0 ? '00' : '30'
    return `${hour.toString().padStart(2, '0')}:${minute}`
})

export default function BookingForm({
    selectedDate,
    selectedTime,
    onDateChange,
    onTimeChange,
    onSubmit,
    loading = false,
}: BookingFormProps) {
    const filterDate = (date: Date) => {
        // Disable past dates
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
    }

    return (
        <div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Thời gian đến
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Chọn ngày và giờ bạn muốn bắt đầu sử dụng dịch vụ
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Date Picker */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Ngày
                    </label>
                    <div className="relative">
                        <DatePicker
                            selected={selectedDate}
                            onChange={onDateChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            locale="vi"
                            filterDate={filterDate}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 pl-11 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            placeholderText="Chọn ngày"
                            wrapperClassName="w-full"
                        />
                        <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
                    </div>
                </div>

                {/* Time Selection */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Giờ bắt đầu
                    </label>
                    <div className="relative">
                        <select
                            value={selectedTime}
                            onChange={(e) => onTimeChange(e.target.value)}
                            className="w-full appearance-none rounded-xl border border-neutral-300 bg-white px-4 py-3 pl-11 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                            <option value="">Chọn giờ</option>
                            {timeSlots.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                        <ClockIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
                    </div>
                </div>
            </div>

            <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
                <Button
                    onClick={onSubmit}
                    disabled={!selectedDate || !selectedTime || loading}

                    className="w-full"
                >
                    {loading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                </Button>
            </div>
        </div>
    )
}
