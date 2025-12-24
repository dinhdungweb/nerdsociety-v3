import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'

// GET - Fetch all customers (requires canViewCustomers permission)
export async function GET() {
    try {
        const { session, hasAccess } = await canView('Customers')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem khách hàng' }, { status: 403 })
        }

        const customers = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                createdAt: true,
                _count: { select: { bookings: true } },
            },
        })

        return NextResponse.json(customers)
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
}
