import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET - Fetch single customer with booking history
export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { session, hasAccess } = await canView('Customers')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem thông tin khách hàng' }, { status: 403 })
        }

        const { id } = await params

        const customer = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                gender: true,
                dateOfBirth: true,
                address: true,
                createdAt: true,
                _count: { select: { bookings: true } },
                bookings: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        bookingCode: true,
                        date: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        estimatedAmount: true,
                        room: { select: { name: true } },
                        location: { select: { name: true } },
                    },
                },
            },
        })

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        return NextResponse.json(customer)
    } catch (error) {
        console.error('Error fetching customer:', error)
        return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
    }
}
