import { prisma } from '@/lib/prisma'
import { PaymentMethod } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/payment/select
 * User selects a payment method after booking is created
 * Creates or updates the Payment record for the booking
 */
export async function POST(request: NextRequest) {
    try {
        const { bookingId, method } = await request.json()

        if (!bookingId || !method) {
            return NextResponse.json(
                { error: 'bookingId and method are required' },
                { status: 400 }
            )
        }

        // Validate method
        const validMethods: PaymentMethod[] = ['CASH', 'VNPAY', 'MOMO', 'ZALOPAY', 'BANK_TRANSFER']
        if (!validMethods.includes(method)) {
            return NextResponse.json(
                { error: 'Invalid payment method' },
                { status: 400 }
            )
        }

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { payment: true },
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        // Check if booking is in valid state for payment selection
        if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
            return NextResponse.json(
                { error: 'Cannot select payment for this booking' },
                { status: 400 }
            )
        }

        // Upsert payment record and set paymentStartedAt on booking
        const [payment] = await prisma.$transaction([
            prisma.payment.upsert({
                where: { bookingId },
                create: {
                    bookingId,
                    amount: booking.depositAmount,
                    method: method as PaymentMethod,
                    status: 'PENDING',
                },
                update: {
                    method: method as PaymentMethod,
                },
            }),
            // Set paymentStartedAt only if not already set (first time selecting payment)
            prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStartedAt: booking.paymentStartedAt ?? new Date(),
                },
            }),
        ])

        // Return response based on method
        let redirectUrl: string | null = null
        let showQR = false

        switch (method) {
            case 'BANK_TRANSFER':
                showQR = true
                break
            case 'VNPAY':
            case 'MOMO':
            case 'ZALOPAY':
                // Future: Generate gateway URL
                redirectUrl = null // Coming soon
                break
            case 'CASH':
                // No action needed, customer will pay at counter
                break
        }

        return NextResponse.json({
            success: true,
            payment: {
                id: payment.id,
                method: payment.method,
                status: payment.status,
            },
            showQR,
            redirectUrl,
        })
    } catch (error) {
        console.error('Error selecting payment method:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
