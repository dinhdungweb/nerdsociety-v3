'use client'

import DatePickerCustomDay from '@/components/DatePickerCustomDay'
import DatePickerCustomHeaderSingleMonth from '@/components/DatePickerCustomHeaderSingleMonth'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { FC } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'

registerLocale('vi', vi)

interface Props {
    className?: string
    value: Date | null
    onChange: (date: Date | null) => void
    minDate?: Date
    placeholder?: string
}

const DateInputPopover: FC<Props> = ({
    className = '',
    value,
    onChange,
    minDate = new Date(),
    placeholder = 'Chọn ngày'
}) => {
    const renderInput = () => {
        return (
            <>
                <div className="text-primary-500 dark:text-primary-400">
                    <CalendarDaysIcon className="size-6" />
                </div>
                <div className="grow text-start">
                    <span className="block text-lg font-semibold text-neutral-900 dark:text-white">
                        {value
                            ? format(value, 'EEEE, dd/MM/yyyy', { locale: vi })
                            : placeholder}
                    </span>
                    <span className="mt-0.5 block text-sm font-light text-neutral-500 dark:text-neutral-400">
                        Ngày sử dụng dịch vụ
                    </span>
                </div>
            </>
        )
    }

    return (
        <Popover className={`group relative z-10 ${className}`}>
            {({ open, close }) => (
                <>
                    <div className="relative">
                        <PopoverButton className="relative flex w-full cursor-pointer items-center gap-x-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-all group-data-open:border-primary-500 group-data-open:shadow-lg hover:border-neutral-300 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600">
                            {renderInput()}
                        </PopoverButton>
                        {value && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onChange(null)
                                }}
                                className="absolute end-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-600"
                            >
                                <XMarkIcon className="size-4" />
                            </button>
                        )}
                    </div>

                    <PopoverPanel
                        transition
                        className="absolute start-0 top-full z-20 mt-3 w-full min-w-[320px] transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 sm:w-auto"
                    >
                        <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10">
                            <DatePicker
                                selected={value}
                                onChange={(date) => {
                                    onChange(date)
                                    close()
                                }}
                                minDate={minDate}
                                locale="vi"
                                inline
                                renderCustomHeader={(props) => <DatePickerCustomHeaderSingleMonth {...props} />}
                                renderDayContents={(day, date) => <DatePickerCustomDay dayOfMonth={day} date={date} />}
                                calendarClassName="!border-0 !bg-transparent"
                            />

                            {/* Quick Actions */}
                            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-700">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(null)
                                    }}
                                    className="text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                >
                                    Xóa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(new Date())
                                        close()
                                    }}
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    Hôm nay
                                </button>
                            </div>
                        </div>
                    </PopoverPanel>
                </>
            )}
        </Popover>
    )
}

export default DateInputPopover
