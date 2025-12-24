'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { ReactDatePickerCustomHeaderProps } from 'react-datepicker'

const DatePickerCustomHeaderSingleMonth = ({
    monthDate,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
}: ReactDatePickerCustomHeaderProps) => {
    return (
        <div className="relative mb-4 flex items-center justify-center pt-2">
            <button
                aria-label="Previous Month"
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
            >
                <ChevronLeftIcon className="size-5 text-neutral-500 dark:text-neutral-400" />
            </button>
            <span className="text-base font-semibold text-neutral-900 dark:text-white">
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
                className="absolute right-0 top-0 flex size-9 items-center justify-center rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
            >
                <ChevronRightIcon className="size-5 text-neutral-500 dark:text-neutral-400" />
            </button>
        </div>
    )
}

export default DatePickerCustomHeaderSingleMonth
