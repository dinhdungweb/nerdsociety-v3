import {
    calculateBookingPriceFromDB,
    calculateDeposit,
    getNerdCoinRewardFromDB,
    getPriceBreakdownFromDB,
} from '@/lib/pricing-db'
import { ServiceType } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

interface CalculateRequest {
    serviceType: ServiceType
    durationMinutes: number
    guests?: number
}

/**
 * POST /api/booking/calculate
 * Tính giá trước khi booking (đọc từ database)
 */
export async function POST(request: NextRequest) {
    try {
        const body: CalculateRequest = await request.json()
        const { serviceType, durationMinutes, guests = 1 } = body

        // Validate required fields
        if (!serviceType) {
            return NextResponse.json(
                { error: 'serviceType is required' },
                { status: 400 }
            )
        }

        if (!durationMinutes || durationMinutes <= 0) {
            return NextResponse.json(
                { error: 'durationMinutes must be a positive number' },
                { status: 400 }
            )
        }

        // Validate serviceType
        const validTypes: ServiceType[] = ['MEETING', 'POD_MONO', 'POD_MULTI']
        if (!validTypes.includes(serviceType)) {
            return NextResponse.json(
                { error: `Invalid serviceType. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            )
        }

        // Calculate pricing from database
        const estimatedAmount = await calculateBookingPriceFromDB(serviceType, durationMinutes, guests)
        const depositAmount = calculateDeposit(estimatedAmount)
        const nerdCoinReward = await getNerdCoinRewardFromDB(serviceType)
        const breakdown = await getPriceBreakdownFromDB(serviceType, durationMinutes, guests)

        return NextResponse.json({
            estimatedAmount,
            depositAmount,
            nerdCoinReward,
            breakdown,
        })
    } catch (error) {
        console.error('Error calculating price:', error)
        return NextResponse.json(
            { error: 'Failed to calculate price' },
            { status: 500 }
        )
    }
}
