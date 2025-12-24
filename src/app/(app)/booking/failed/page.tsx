import { XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function BookingFailedPage({
    searchParams,
}: {
    searchParams: { error?: string; id?: string }
}) {
    const errorMap: Record<string, string> = {
        signature: 'Lỗi xác thực chữ ký (Checksum failed)',
        not_found: 'Không tìm thấy giao dịch',
        payment_failed: 'Giao dịch bị từ chối hoặc thất bại',
        internal: 'Lỗi hệ thống',
    }

    const errorMessage = searchParams.error ? errorMap[searchParams.error] || 'Đã xảy ra lỗi không xác định' : 'Thanh toán thất bại'

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-neutral-50 px-4 py-16 dark:bg-neutral-950">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-neutral-900">
                <div className="mb-6 flex justify-center">
                    <div className="flex size-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <XCircleIcon className="size-10" />
                    </div>
                </div>

                <h1 className="mb-2 text-center text-2xl font-bold text-neutral-900 dark:text-white">
                    Thanh toán thất bại
                </h1>
                <p className="mb-8 text-center text-neutral-500 dark:text-neutral-400">
                    {errorMessage}
                </p>

                <div className="flex flex-col gap-3">
                    {searchParams.id && (
                        <Link
                            href={`/profile/bookings/${searchParams.id}`}
                            className="flex w-full items-center justify-center rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-600"
                        >
                            Thử lại
                        </Link>
                    )}
                    <Link
                        href="/"
                        className="flex w-full items-center justify-center rounded-xl bg-neutral-100 px-6 py-3 font-medium text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
