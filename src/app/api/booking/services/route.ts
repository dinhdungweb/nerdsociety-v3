import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * GET /api/booking/services
 * Lấy danh sách services active cho booking
 */
export async function GET() {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                description: true,
                priceSmall: true,
                priceLarge: true,
                priceFirstHour: true,
                pricePerHour: true,
                nerdCoinReward: true,
                minDuration: true,
                timeStep: true,
                features: true,
                icon: true,
                image: true,
            },
            orderBy: { sortOrder: 'asc' },
        })

        return NextResponse.json({ services })
    } catch (error) {
        console.error('Error fetching services:', error)
        return NextResponse.json(
            { error: 'Failed to fetch services' },
            { status: 500 }
        )
    }
}
