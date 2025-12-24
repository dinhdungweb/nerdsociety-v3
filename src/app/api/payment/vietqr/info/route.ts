import { prisma } from '@/lib/prisma'
import { getPaymentInfo, isVietQRConfigured } from '@/lib/vietqr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/payment/vietqr/info?bookingId=xxx
 * Get VietQR payment info for a booking
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const bookingId = searchParams.get('bookingId')

        if (!bookingId) {
            return NextResponse.json(
                { error: 'bookingId is required' },
                { status: 400 }
            )
        }

        // Check if VietQR is configured
        if (!isVietQRConfigured()) {
            return NextResponse.json(
                { error: 'VietQR is not configured' },
                { status: 500 }
            )
        }

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: {
                id: true,
                bookingCode: true,
                depositAmount: true,
                status: true,
                depositPaidAt: true,
            },
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        // Check if already paid (depositPaidAt is not null means paid)
        if (booking.depositPaidAt) {
            return NextResponse.json(
                { error: 'Deposit already paid' },
                { status: 400 }
            )
        }

        // Generate payment info
        const paymentInfo = getPaymentInfo({
            amount: booking.depositAmount,
            bookingCode: booking.bookingCode,
        })

        return NextResponse.json({
            ...paymentInfo,
            bookingCode: booking.bookingCode,
            bookingId: booking.id,
        })
    } catch (error) {
        console.error('Error getting VietQR info:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
