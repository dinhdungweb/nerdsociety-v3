'use client'

import { ClockIcon, CurrencyDollarIcon, FireIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

interface Combo {
    id: string
    name: string
    duration: number
    price: number
    description: string
    features: string[]
    isPopular: boolean
}

interface ComboSelectorProps {
    combos: Combo[]
    selectedComboId: string
    onSelect: (combo: Combo) => void
}

export default function ComboSelector({
    combos,
    selectedComboId,
    onSelect,
}: ComboSelectorProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => {
                const isSelected = selectedComboId === combo.id
                return (
                    <div
                        key={combo.id}
                        onClick={() => onSelect(combo)}
                        className={clsx(
                            'group relative cursor-pointer overflow-hidden rounded-xl border-2 p-5 transition-all',
                            isSelected
                                ? 'border-primary-500 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/10'
                                : 'border-transparent bg-white shadow-sm hover:border-primary-200 hover:shadow-md dark:bg-neutral-900 dark:hover:border-primary-800'
                        )}
                    >
                        {combo.isPopular && (
                            <div className="absolute -right-12 top-6 rotate-45 bg-yellow-400 px-12 py-1 text-xs font-bold text-yellow-950 shadow-sm">
                                POPULAR
                            </div>
                        )}

                        <div className="mb-4 flex items-center justify-between">
                            <h3
                                className={clsx(
                                    'font-semibold transition-colors',
                                    isSelected
                                        ? 'text-primary-700 dark:text-primary-300'
                                        : 'text-neutral-900 dark:text-white'
                                )}
                            >
                                {combo.name}
                            </h3>
                            {isSelected && <CheckCircleIcon className="size-6 text-primary-500" />}
                        </div>

                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {combo.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                <ClockIcon className="size-4 text-neutral-400" />
                                {combo.duration >= 60 ? `${combo.duration / 60}h` : `${combo.duration}p`}
                            </div>
                            <div className="flex items-center gap-1.5 text-base font-bold text-primary-600 dark:text-primary-400">
                                <CurrencyDollarIcon className="size-5" />
                                {new Intl.NumberFormat('vi-VN').format(combo.price)}đ
                            </div>
                        </div>

                        <ul className="mt-4 space-y-2">
                            {combo.features.slice(0, 3).map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                    <span className="size-1 rounded-full bg-primary-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            })}
        </div>
    )
}
