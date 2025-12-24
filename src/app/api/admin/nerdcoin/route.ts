import { canView, canManage } from '@/lib/apiPermissions'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Fetch all customers with Nerd Coin info
export async function GET() {
    try {
        const { session, hasAccess } = await canView('NerdCoin')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem Nerd Coin' }, { status: 403 })
        }

        const customers = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            orderBy: { nerdCoinBalance: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                nerdCoinBalance: true,
                nerdCoinTier: true,
                _count: { select: { bookings: true } },
                createdAt: true,
            },
        })

        // Get Nerd Coin stats
        const stats = await prisma.user.aggregate({
            where: { role: 'CUSTOMER' },
            _sum: { nerdCoinBalance: true },
            _avg: { nerdCoinBalance: true },
        })

        const tierCounts = await prisma.user.groupBy({
            by: ['nerdCoinTier'],
            where: { role: 'CUSTOMER' },
            _count: true,
        })

        return NextResponse.json({
            customers,
            stats: {
                totalCoins: stats._sum.nerdCoinBalance || 0,
                avgCoins: Math.round(stats._avg.nerdCoinBalance || 0),
                tierCounts: tierCounts.reduce((acc, t) => {
                    acc[t.nerdCoinTier] = t._count
                    return acc
                }, {} as Record<string, number>),
            },
        })
    } catch (error) {
        console.error('Error fetching Nerd Coin data:', error)
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }
}

// POST - Add/adjust Nerd Coin for a customer
export async function POST(req: Request) {
    try {
        const { session, hasAccess } = await canManage('NerdCoin')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền điều chỉnh Nerd Coin' }, { status: 403 })
        }

        const { userId, amount, type, description } = await req.json()

        if (!userId || amount === undefined || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Create transaction and update balance
        const [transaction, user] = await prisma.$transaction([
            prisma.nerdCoinTransaction.create({
                data: {
                    userId,
                    amount,
                    type,
                    description,
                },
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    nerdCoinBalance: { increment: amount },
                },
            }),
        ])

        // Update tier based on new balance
        let newTier = 'BRONZE'
        if (user.nerdCoinBalance >= 100) newTier = 'GOLD'
        else if (user.nerdCoinBalance >= 50) newTier = 'SILVER'

        if (newTier !== user.nerdCoinTier) {
            await prisma.user.update({
                where: { id: userId },
                data: { nerdCoinTier: newTier },
            })
        }

        return NextResponse.json({
            transaction,
            newBalance: user.nerdCoinBalance,
            newTier,
        })
    } catch (error) {
        console.error('Error adjusting Nerd Coin:', error)
        return NextResponse.json({ error: 'Failed to adjust coins' }, { status: 500 })
    }
}
