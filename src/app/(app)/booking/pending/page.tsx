'use client'

import { Button } from '@/shared/Button'
import { ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

const PaymentPendingContent = () => {
    const searchParams = useSearchParams()
    const bookingId = searchParams.get('id')

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 px-4 py-16 dark:from-neutral-950 dark:to-neutral-900">
            <div className="w-full max-w-md">
                {/* Card Container */}
                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-neutral-200/50 dark:bg-neutral-900 dark:shadow-neutral-950/50">
                    {/* Animated Icon */}
                    <div className="relative mx-auto mb-8 size-24">
                        {/* Pulse rings */}
                        <div className="absolute inset-0 animate-ping rounded-full bg-primary-400/20" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-2 animate-ping rounded-full bg-primary-400/30" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                        {/* Main icon */}
                        <div className="relative flex size-full items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30">
                            <ClockIcon className="size-12 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
                        Đã ghi nhận thanh toán!
                    </h1>

                    {/* Description */}
                    <p className="mt-3 text-center text-neutral-600 dark:text-neutral-400">
                        Cảm ơn bạn đã thông báo thanh toán. Chúng tôi sẽ xác nhận trong thời gian sớm nhất.
                    </p>

                    {/* Status Card */}
                    <div className="mt-8 overflow-hidden rounded-2xl border border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20">
                        <div className="flex items-center gap-3 border-b border-primary-200 bg-white/50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/30">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50">
                                <ClockIcon className="size-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="font-semibold text-primary-700 dark:text-primary-300">Chờ xác nhận thanh toán</span>
                        </div>
                        <div className="px-4 py-4">
                            <p className="text-sm leading-relaxed text-primary-700 dark:text-primary-300">
                                Quản trị viên sẽ kiểm tra và xác nhận thanh toán của bạn. Bạn sẽ nhận được email xác nhận sau khi hoàn tất.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col gap-3">
                        <Link href="/profile">
                            <Button className="w-full cursor-pointer justify-center">
                                Xem lịch sử đặt phòng
                            </Button>
                        </Link>
                        <Link href="/">
                            <button className="w-full cursor-pointer rounded-full border border-neutral-300 bg-white px-6 py-3 font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
                                Về trang chủ
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Help - Outside card */}
                <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Có vấn đề? Liên hệ{' '}
                    <a href="tel:0901234567" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
                        0901 234 567
                    </a>
                </p>
            </div>
        </div>
    )
}

export default function PaymentPendingPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
            <div className="animate-pulse text-lg text-neutral-600">Đang tải...</div>
        </div>}>
            <PaymentPendingContent />
        </Suspense>
    )
}
