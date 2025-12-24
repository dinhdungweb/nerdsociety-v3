import { canView } from '@/lib/apiPermissions'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Fetch transaction history for a customer
export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { session, hasAccess } = await canView('NerdCoin')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem lịch sử Nerd Coin' }, { status: 403 })
        }

        const { id } = await params

        const transactions = await prisma.nerdCoinTransaction.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                nerdCoinBalance: true,
                nerdCoinTier: true,
            },
        })

        return NextResponse.json({ user, transactions })
    } catch (error) {
        console.error('Error fetching transactions:', error)
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }
}
