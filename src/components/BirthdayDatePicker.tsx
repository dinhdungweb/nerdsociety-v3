'use client'

import DatePickerCustomDay from '@/components/DatePickerCustomDay'
import DatePickerBirthdayHeader from '@/components/DatePickerBirthdayHeader'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { FC } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'

registerLocale('vi', vi)

interface Props {
    value: Date | null
    onChange: (date: Date | null) => void
    placeholder?: string
    label?: string
}

const BirthdayDatePicker: FC<Props> = ({
    value,
    onChange,
    placeholder = 'Chọn ngày sinh',
    label = 'Ngày sinh'
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {label}
            </label>
            <Popover className="group relative">
                {({ close }) => (
                    <>
                        <div className="relative">
                            <PopoverButton className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-left transition-all group-data-open:border-primary-500 group-data-open:ring-2 group-data-open:ring-primary-500/20 hover:border-neutral-400 focus:outline-none dark:border-neutral-600 dark:bg-neutral-700 dark:hover:border-neutral-500">
                                <CalendarDaysIcon className="size-5 text-neutral-400" />
                                <span className={value ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}>
                                    {value
                                        ? format(value, 'dd/MM/yyyy', { locale: vi })
                                        : placeholder}
                                </span>
                            </PopoverButton>
                            {value && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onChange(null)
                                    }}
                                    className="absolute right-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-500"
                                >
                                    <XMarkIcon className="size-4" />
                                </button>
                            )}
                        </div>

                        <PopoverPanel
                            transition
                            className="absolute left-0 top-full z-50 mt-2 w-auto min-w-[300px] transition duration-150 data-closed:translate-y-1 data-closed:opacity-0"
                        >
                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                                <DatePicker
                                    selected={value}
                                    onChange={(date) => {
                                        onChange(date)
                                        close()
                                    }}
                                    maxDate={new Date()}
                                    locale="vi"
                                    inline
                                    renderCustomHeader={(props) => <DatePickerBirthdayHeader {...props} />}
                                    renderDayContents={(day, date) => <DatePickerCustomDay dayOfMonth={day} date={date} />}
                                    calendarClassName="!border-0 !bg-transparent"
                                />

                                {/* Quick Actions */}
                                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-700">
                                    <button
                                        type="button"
                                        onClick={() => onChange(null)}
                                        className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                    >
                                        Xóa
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(new Date())
                                            close()
                                        }}
                                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                                    >
                                        Hôm nay
                                    </button>
                                </div>
                            </div>
                        </PopoverPanel>
                    </>
                )}
            </Popover>
        </div>
    )
}

export default BirthdayDatePicker
