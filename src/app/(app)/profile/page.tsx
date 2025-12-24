import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CalendarDaysIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    COMPLETED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    NO_SHOW: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500',
}

const statusLabels: Record<string, string> = {
    PENDING: 'Chờ cọc',
    CONFIRMED: 'Đã xác nhận',
    IN_PROGRESS: 'Đang sử dụng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    NO_SHOW: 'Không đến',
}

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const bookings = await prisma.booking.findMany({
        where: { userId: session.user.id },
        include: {
            location: true,
            room: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Lịch sử đặt lịch</h2>
                <Link
                    href="/booking"
                    className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                >
                    Đặt lịch mới
                </Link>
            </div>

            {bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Link
                            key={booking.id}
                            href={`/profile/bookings/${booking.id}`}
                            className="block rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[booking.status]}`}>
                                            {statusLabels[booking.status]}
                                        </span>
                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                            #{booking.bookingCode}
                                        </span>
                                    </div>
                                    <h3 className="mt-2 font-medium text-neutral-900 dark:text-white">
                                        {booking.room.name}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                                        <div className="flex items-center gap-1">
                                            <CalendarDaysIcon className="size-4" />
                                            {new Date(booking.date).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPinIcon className="size-4" />
                                            {booking.location.name}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {new Intl.NumberFormat('vi-VN').format(booking.estimatedAmount)}đ
                                    </span>
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {booking.startTime} - {booking.endTime}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                    <p className="text-neutral-500 dark:text-neutral-400">Bạn chưa có đặt lịch nào</p>
                </div>
            )}
        </div>
    )
}

