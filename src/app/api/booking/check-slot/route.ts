import { isSlotAvailable } from '@/lib/booking-utils'
import { NextRequest, NextResponse } from 'next/server'

interface CheckSlotRequest {
    roomId: string
    date: string // ISO date string
    startTime: string // "HH:MM"
    endTime: string // "HH:MM"
}

/**
 * POST /api/booking/check-slot
 * Kiểm tra tính khả dụng của một khung giờ cụ thể
 */
export async function POST(request: NextRequest) {
    try {
        const body: CheckSlotRequest = await request.json()
        const { roomId, date, startTime, endTime } = body

        // Validate required fields
        if (!roomId || !date || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const bookingDate = new Date(date)
        if (isNaN(bookingDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            )
        }

        // Check availability using shared logic
        const available = await isSlotAvailable(roomId, bookingDate, startTime, endTime)

        if (!available) {
            return NextResponse.json(
                { 
                    available: false,
                    error: 'Khung giờ này đã có người đặt' 
                },
                { status: 200 } // Return 200 with available: false to handle gracefully in frontend
            )
        }

        return NextResponse.json({ available: true })
    } catch (error) {
        console.error('Error checking slot availability:', error)
        return NextResponse.json(
            { error: 'Failed to check availability' },
            { status: 500 }
        )
    }
}
