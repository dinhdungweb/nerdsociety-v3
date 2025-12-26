'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface CancelBookingButtonProps {
    bookingId: string
    bookingCode: string
    canCancel: boolean
    minutesToStart: number
}

export default function CancelBookingButton({
    bookingId,
    bookingCode,
    canCancel,
    minutesToStart
}: CancelBookingButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCancel = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/booking/${bookingId}/cancel`, {
                method: 'POST',
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra')
            }

            toast.success('Đã hủy đặt lịch thành công')
            setIsOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!canCancel) {
        return (
            <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                {minutesToStart < 360
                    ? 'Không thể hủy (dưới 6 tiếng trước giờ)'
                    : 'Không thể hủy booking này'}
            </div>
        )
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
                <XMarkIcon className="size-4" />
                Hủy đặt lịch
            </button>

            {/* Cancel Confirmation Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
                        <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400">
                            <ExclamationTriangleIcon className="size-6" />
                            <h3 className="text-lg font-semibold">Xác nhận hủy đặt lịch</h3>
                        </div>

                        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                            Bạn có chắc muốn hủy đặt lịch <strong>#{bookingCode}</strong>?
                        </p>

                        <div className="mt-4 rounded-lg bg-primary-50 p-4 text-sm text-primary-900 dark:bg-primary-900/20 dark:text-primary-100">
                            <p className="font-semibold">Chính sách hoàn hủy:</p>
                            <p className="mt-1">
                                Bạn đang thực hiện huỷ <strong>trước giờ bắt đầu 6 tiếng</strong>.
                            </p>
                            <p className="mt-2 text-primary-800 dark:text-primary-200">
                                Vui lòng liên hệ Fanpage để được hỗ trợ <strong>lưu cọc</strong> cho lần sử dụng sau.
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="flex-1 cursor-pointer rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? 'Đang hủy...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
