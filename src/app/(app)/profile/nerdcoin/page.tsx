import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function NerdCoinPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    // Get user's Nerd Coin balance from bookings
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            nerdCoinBalance: true,
        },
    })

    // Get Nerd Coin history from bookings
    const bookingsWithCoins = await prisma.booking.findMany({
        where: {
            userId: session.user.id,
            nerdCoinIssued: { gt: 0 },
        },
        select: {
            id: true,
            bookingCode: true,
            nerdCoinIssued: true,
            nerdCoinIssuedAt: true,
            room: { select: { name: true } },
        },
        orderBy: { nerdCoinIssuedAt: 'desc' },
        take: 20,
    })

    const balance = user?.nerdCoinBalance || 0

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <div className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-6 dark:border-yellow-900/50 dark:from-yellow-900/20 dark:to-amber-900/20">
                <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                        <CurrencyDollarIcon className="size-7 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Số dư Nerd Coin</p>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {balance} <span className="text-lg font-normal">coin</span>
                        </p>
                    </div>
                </div>
                <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                    Nerd Coin có thể dùng để đổi đồ uống hoặc dịch vụ tại quầy.
                </p>
            </div>

            {/* History */}
            <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                    Lịch sử nhận Nerd Coin
                </h2>

                {bookingsWithCoins.length > 0 ? (
                    <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
                        {bookingsWithCoins.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {booking.room.name}
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        #{booking.bookingCode} • {booking.nerdCoinIssuedAt
                                            ? new Date(booking.nerdCoinIssuedAt).toLocaleDateString('vi-VN')
                                            : '---'}
                                    </p>
                                </div>
                                <span className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
                                    +{booking.nerdCoinIssued}
                                    <CurrencyDollarIcon className="size-4" />
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                        <CurrencyDollarIcon className="mx-auto size-10 text-neutral-300 dark:text-neutral-600" />
                        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                            Bạn chưa nhận được Nerd Coin nào
                        </p>
                        <p className="text-sm text-neutral-400 dark:text-neutral-500">
                            Đặt Pod để nhận Nerd Coin khi check-in
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
