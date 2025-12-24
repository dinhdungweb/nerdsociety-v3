'use client'

import { Button } from '@/shared/Button'
import {
    EnvelopeIcon,
    GlobeAltIcon,
    PhoneIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface ContactNerdProps {
    contactTitle?: string
    contactSubtitle?: string
    contactEmail?: string
    contactPhone?: string
    contactWebsite?: string
    contactCtaTitle?: string
    contactCtaSubtitle?: string
    contactCtaButton?: string
    contactCtaLink?: string
}

export default function ContactNerd({
    contactTitle = 'Sẵn sàng trải nghiệm?',
    contactSubtitle = 'Nerd xin chúc bạn có 1 ngày học tập, làm việc vui vẻ và hiệu quả! Đặt lịch ngay để có chỗ ngồi ưng ý nhất.',
    contactEmail = 'nerd.society98@gmail.com',
    contactPhone = '036 848 3689',
    contactWebsite = 'nerdsociety.com.vn',
    contactCtaTitle = 'Đặt lịch ngay hôm nay!',
    contactCtaSubtitle = 'Chỉ mất 30 giây để đặt chỗ',
    contactCtaButton = 'Đặt lịch ngay',
    contactCtaLink = '/booking',
}: ContactNerdProps) {
    return (
        <section id="contact" className="bg-neutral-50 py-20 lg:py-28 dark:bg-neutral-800/50">
            <div className="container">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white shadow-2xl md:p-12">
                        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
                            {/* Left content */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl">
                                    {contactTitle}
                                </h2>
                                <p className="mt-4 text-primary-100">
                                    {contactSubtitle}
                                </p>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <EnvelopeIcon className="size-6" />
                                        <div>
                                            <div className="text-sm text-primary-200">Email</div>
                                            <a href={`mailto:${contactEmail}`} className="font-medium hover:underline">
                                                {contactEmail}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <PhoneIcon className="size-6" />
                                        <div>
                                            <div className="text-sm text-primary-200">Hotline</div>
                                            <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="font-medium hover:underline">
                                                {contactPhone}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <GlobeAltIcon className="size-6" />
                                        <div>
                                            <div className="text-sm text-primary-200">Website</div>
                                            <a href={`https://${contactWebsite}`} className="font-medium hover:underline">
                                                {contactWebsite}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right content - CTA */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-8 backdrop-blur-sm"
                            >
                                <RocketLaunchIcon className="size-16" />
                                <h3 className="mt-4 text-center text-xl font-semibold">
                                    {contactCtaTitle}
                                </h3>
                                <p className="mt-2 text-center text-sm text-primary-100">
                                    {contactCtaSubtitle}
                                </p>
                                <Button
                                    href={contactCtaLink}
                                    color="white"
                                    className="mt-6 !text-primary-600 hover:!bg-primary-50"
                                >
                                    {contactCtaButton}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

