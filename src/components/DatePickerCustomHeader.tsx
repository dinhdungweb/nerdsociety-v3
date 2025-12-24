'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { ReactDatePickerCustomHeaderProps } from 'react-datepicker'

const DatePickerCustomHeader = ({
    monthDate,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
}: ReactDatePickerCustomHeaderProps) => {
    return (
        <div className="flex items-center justify-between px-2 pb-4">
            <button
                aria-label="Previous Month"
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
                <ChevronLeftIcon className="size-4" />
            </button>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                {monthDate.toLocaleString('vi-VN', {
                    month: 'long',
                    year: 'numeric',
                })}
            </span>
            <button
                aria-label="Next Month"
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
                <ChevronRightIcon className="size-4" />
            </button>
        </div>
    )
}

export default DatePickerCustomHeader
