'use client'

import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import { getYear, getMonth } from 'date-fns'

const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
]

// Generate years from 1920 to current year
const currentYear = getYear(new Date())
const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i)

const DatePickerBirthdayHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
}: ReactDatePickerCustomHeaderProps) => {
    return (
        <div className="mb-4 flex items-center justify-between gap-2 px-2 pt-2 sm:gap-4">
            {/* Previous Month Button */}
            <button
                aria-label="Previous Month"
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="flex size-9 items-center justify-center rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
            >
                <ChevronLeftIcon className="size-5 text-neutral-500 dark:text-neutral-400" />
            </button>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <select
                        value={getMonth(date)}
                        onChange={({ target: { value } }) => changeMonth(parseInt(value))}
                        className="hide-select-arrow cursor-pointer rounded-lg border border-neutral-200 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-neutral-900 transition-colors hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                        {months.map((month, index) => (
                            <option key={month} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                </div>

                <div className="relative">
                    <select
                        value={getYear(date)}
                        onChange={({ target: { value } }) => changeYear(parseInt(value))}
                        className="hide-select-arrow cursor-pointer rounded-lg border border-neutral-200 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-neutral-900 transition-colors hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                </div>
            </div>

            {/* Next Month Button */}
            <button
                aria-label="Next Month"
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="flex size-9 items-center justify-center rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
            >
                <ChevronRightIcon className="size-5 text-neutral-500 dark:text-neutral-400" />
            </button>
        </div>
    )
}

export default DatePickerBirthdayHeader
