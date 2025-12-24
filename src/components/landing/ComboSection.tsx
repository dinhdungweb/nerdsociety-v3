'use client'

import { Button } from '@/shared/Button'
import {
    BookOpenIcon,
    CheckIcon,
    ClockIcon,
    FireIcon,
    MoonIcon,
    PresentationChartBarIcon,
    SunIcon,
    UserGroupIcon,
    StarIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import React from 'react'

// Coffee icon
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
    </svg>
)

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    ClockIcon,
    FireIcon,
    BookOpenIcon,
    SunIcon,
    MoonIcon,
    CoffeeIcon,
    PresentationChartBarIcon,
    UserGroupIcon,
    StarIcon,
}

interface Combo {
    id: string
    name: string
    price: number
    duration: number
    features: string[]
    description: string | null
    isPopular: boolean
    icon: string | null
    image: string | null
}

interface ComboSectionProps {
    combos?: Combo[]
}

export default function ComboSection({ combos = [] }: ComboSectionProps) {
    return (
        <section id="combos" className="py-20 lg:py-28">
            <div className="container">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                    >
                        Bảng giá
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white"
                    >
                        Combo tại Nerd Society
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-lg text-neutral-600 dark:text-neutral-300"
                    >
                        Chọn gói phù hợp với nhu cầu học tập và làm việc của bạn
                    </motion.p>
                </div>

                {/* Combo Grid */}
                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {combos.map((combo, index) => {
                        const Icon = combo.icon && ICON_MAP[combo.icon] ? ICON_MAP[combo.icon] : ClockIcon
                        const formattedPrice = new Intl.NumberFormat('vi-VN').format(combo.price) + 'đ'
                        const formattedDuration = combo.duration >= 60
                            ? `${(combo.duration / 60).toFixed(1).replace('.0', '')} giờ`
                            : `${combo.duration} phút`

                        return (
                            <motion.div
                                key={combo.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative flex flex-col rounded-3xl border bg-white p-6 transition-all hover:shadow-xl dark:bg-neutral-800 ${combo.isPopular
                                    ? 'border-primary-500 ring-2 ring-primary-500'
                                    : 'border-neutral-200 dark:border-neutral-700'
                                    }`}
                            >
                                {combo.isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white">
                                        PHỔ BIẾN
                                    </div>
                                )}

                                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/50 overflow-hidden">
                                    {combo.image ? (
                                        <img src={combo.image} alt={combo.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Icon className="size-6 text-primary-600 dark:text-primary-400" />
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{combo.name}</h3>

                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                        {formattedPrice}
                                    </span>
                                    <span className="text-sm text-neutral-500">/ {formattedDuration}</span>
                                </div>

                                <ul className="mt-6 flex-1 space-y-3">
                                    {combo.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                            <CheckIcon className="size-5 shrink-0 text-primary-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {combo.isPopular ? (
                                    <Button
                                        color="primary"
                                        href="/booking"
                                        className="mt-6 w-full justify-center"
                                    >
                                        Đặt tại đây
                                    </Button>
                                ) : (
                                    <Button
                                        outline
                                        href="/booking"
                                        className="mt-6 w-full justify-center"
                                    >
                                        Đặt tại đây
                                    </Button>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
