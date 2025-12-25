'use client'

import {
    BoltIcon,
    BookOpenIcon,
    PresentationChartBarIcon,
    SparklesIcon,
    WifiIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import React from 'react'

// Coffee icon
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h15a3 3 0 013 3v1a3 3 0 01-3 3h-1.5M3 8v8a4 4 0 004 4h5a4 4 0 004-4v-3M3 8l1-4h13l1 4M7.5 8v1.5m4-1.5v1.5" />
    </svg>
)

// Icon mapping
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    BookOpenIcon,
    CoffeeIcon,
    WifiIcon,
    BoltIcon,
    SparklesIcon,
    PresentationChartBarIcon,
}

// Feature interface
export interface AboutFeature {
    icon: string
    image?: string
    title: string
    description: string
}

// Default features
const defaultFeatures: AboutFeature[] = [
    {
        icon: 'BookOpenIcon',
        title: 'Không gian yên tĩnh',
        description: 'Môi trường lý tưởng để tập trung học tập và làm việc',
    },
    {
        icon: 'CoffeeIcon',
        title: 'Đồ uống miễn phí',
        description: 'Cafe đen, trà túi lọc không giới hạn suốt thời gian sử dụng',
    },
    {
        icon: 'WifiIcon',
        title: 'Wifi tốc độ cao',
        description: 'Kết nối internet ổn định, tốc độ cao cho mọi nhu cầu',
    },
    {
        icon: 'BoltIcon',
        title: 'Ổ cắm điện',
        description: 'Ổ cắm điện tiện lợi tại mọi vị trí ngồi',
    },
    {
        icon: 'SparklesIcon',
        title: 'Máy lạnh',
        description: 'Không gian mát mẻ, thoải mái quanh năm',
    },
    {
        icon: 'PresentationChartBarIcon',
        title: 'Phòng họp riêng',
        description: 'Phòng họp có máy chiếu, bảng trắng cho nhóm 2-12 người',
    },
]

interface AboutNerdProps {
    aboutTitle?: string
    aboutContent?: string
    aboutFeatures?: AboutFeature[]
}

export default function AboutNerd({
    aboutTitle = 'Nerd Society là gì?',
    aboutContent = 'Cộng đồng học tập Gen Z năng động tại Hà Nội. Chúng tôi mang đến không gian làm việc chung và học nhóm lý tưởng, nơi bạn có thể kết nối, phát triển bản thân và chinh phục mọi kiến thức!',
    aboutFeatures,
}: AboutNerdProps) {
    const features = aboutFeatures && aboutFeatures.length > 0 ? aboutFeatures : defaultFeatures

    return (
        <section id="about" className="py-20 lg:py-28">
            <div className="container">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                    >
                        Về chúng tôi
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white"
                    >
                        {aboutTitle}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-lg text-neutral-600 dark:text-neutral-300"
                    >
                        {aboutContent}
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const IconComponent = iconMap[feature.icon || ''] || BookOpenIcon
                        return (
                            <motion.div
                                key={feature.title + index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group rounded-3xl border border-neutral-200 bg-white p-8 transition-all hover:border-primary-200 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-primary-700"
                            >
                                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/50 overflow-hidden">
                                    {feature.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <IconComponent className="size-6 text-primary-600 dark:text-primary-400" />
                                    )}
                                </div>
                                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

