'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface BookingBannerProps {
    enabled?: boolean
    image?: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
}

export default function BookingBanner({
    enabled = true,
    image,
    title = 'Đặt lịch không gian làm việc',
    subtitle = 'Chọn pod hoặc phòng họp phù hợp với nhu cầu của bạn. Đặt lịch nhanh chóng, dễ dàng.',
    ctaText,
    ctaLink = '#booking-form',
}: BookingBannerProps) {
    if (!enabled) return null

    return (
        <section className="relative min-h-[280px] overflow-hidden sm:min-h-[350px]">
            {/* Background Image */}
            <div className="absolute inset-0">
                {image ? (
                    <img
                        src={image}
                        alt="Booking Banner"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary-200 via-primary-100 to-secondary-200 dark:from-primary-900 dark:via-neutral-900 dark:to-secondary-900" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
            </div>

            {/* Content */}
            <div className="container relative flex h-full min-h-[280px] items-center py-12 sm:min-h-[350px] sm:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl"
                >
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-4 text-base text-white/90 drop-shadow-md sm:text-lg lg:text-xl">
                        {subtitle}
                    </p>

                    {ctaText && (
                        <div className="mt-6 sm:mt-8">
                            <Link
                                href={ctaLink}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-neutral-900 shadow-xl transition-all hover:scale-105 hover:bg-primary-50 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-lg"
                            >
                                {ctaText}
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

