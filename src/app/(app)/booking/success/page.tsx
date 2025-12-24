import PaymentButton from '@/components/booking/PaymentButton'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CheckCircleIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BookingSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ id: string; payment?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const params = await searchParams
    const bookingId = params.id
    if (!bookingId) notFound()

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            location: true,
            room: true,
            payment: true,
        },
    })

    if (!booking || booking.userId !== session.user.id) notFound()

    // Check if payment is complete OR cash payment confirmed via URL param
    const isCashPayment = params.payment === 'cash'
    const isPaymentSuccess = params.payment === 'success' || booking.payment?.status === 'COMPLETED' || isCashPayment
    const isPending = !isPaymentSuccess && booking.payment?.status === 'PENDING'

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-16 dark:bg-neutral-950">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm dark:bg-neutral-900">
                <div className="mb-6 flex justify-center">
                    {isPending ? (
                        <div className="flex size-20 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <ClockIcon className="size-10" />
                        </div>
                    ) : (
                        <div className="flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircleIcon className="size-10" />
                        </div>
                    )}
                </div>

                <h1 className="mb-2 text-center text-2xl font-bold text-neutral-900 dark:text-white">
                    {isPending ? 'Hoàn tất đặt lịch' : isCashPayment ? 'Đặt lịch thành công!' : 'Thanh toán thành công!'}
                </h1>
                <p className="mb-2 text-center text-neutral-500 dark:text-neutral-400">
                    Mã đặt lịch của bạn là <span className="font-mono font-bold text-neutral-900 dark:text-white">{booking.bookingCode}</span>
                </p>
                {isPending && (
                    <p className="mb-4 text-center text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Vui lòng chọn phương thức thanh toán để hoàn tất
                    </p>
                )}
                {isCashPayment && (
                    <p className="mb-6 text-center text-sm text-green-600 dark:text-green-400">
                        💵 Vui lòng thanh toán tại quầy khi đến
                    </p>
                )}

                <div className="space-y-4 rounded-xl border border-neutral-100 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800/50">
                    <div className="flex items-start gap-4">
                        <MapPinIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                        <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {booking.location.name}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {booking.location.address}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <ClockIcon className="mt-0.5 size-5 flex-shrink-0 text-neutral-400" />
                        <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                                {new Date(booking.date).toLocaleDateString('vi-VN')}
                            </p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {booking.startTime} - {booking.endTime} ({booking.room.name})
                            </p>
                        </div>
                    </div>

                    {/* Price info */}
                    <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Tổng tiền:</span>
                            <span className="font-medium text-neutral-900 dark:text-white">
                                {new Intl.NumberFormat('vi-VN').format(booking.estimatedAmount)}đ
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Đặt cọc:</span>
                            <span className="font-medium text-primary-600">
                                {new Intl.NumberFormat('vi-VN').format(booking.depositAmount)}đ
                            </span>
                        </div>
                        {booking.nerdCoinIssued > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Nerd Coin:</span>
                                <span className="font-medium text-yellow-600">
                                    +{booking.nerdCoinIssued} 🪙
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isPending && (
                    <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
                        <PaymentButton bookingId={booking.id} amount={booking.depositAmount} />
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    <Link
                        href="/"
                        className={`flex w-full items-center justify-center rounded-xl px-6 py-3 font-semibold transition-colors ${isPending
                            ? 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                            : 'bg-primary-500 text-white hover:bg-primary-600'
                            }`}
                    >
                        Về trang chủ
                    </Link>
                    <Link
                        href={`/profile/bookings/${booking.id}`}
                        className="flex w-full items-center justify-center rounded-xl bg-neutral-100 px-6 py-3 font-medium text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
                    >
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </div>
    )
}

