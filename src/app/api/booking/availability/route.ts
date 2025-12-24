import { getBookedSlots, OPERATING_HOURS } from '@/lib/booking-utils'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/booking/availability?roomId=xxx&date=2024-12-15
 * Kiểm tra slot trống của room theo ngày
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const roomId = searchParams.get('roomId')
        const dateStr = searchParams.get('date')

        // Validate required params
        if (!roomId) {
            return NextResponse.json(
                { error: 'roomId is required' },
                { status: 400 }
            )
        }

        if (!dateStr) {
            return NextResponse.json(
                { error: 'date is required' },
                { status: 400 }
            )
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(dateStr)) {
            return NextResponse.json(
                { error: 'Invalid date format. Expected YYYY-MM-DD' },
                { status: 400 }
            )
        }


        // Get booked slots - pass dateStr directly (getBookedSlots now expects string)
        const bookedSlots = await getBookedSlots(roomId, dateStr)

        return NextResponse.json({
            bookedSlots,
            operatingHours: OPERATING_HOURS,
        })
    } catch (error) {
        console.error('Error fetching availability:', error)
        return NextResponse.json(
            { error: 'Failed to fetch availability' },
            { status: 500 }
        )
    }
}
