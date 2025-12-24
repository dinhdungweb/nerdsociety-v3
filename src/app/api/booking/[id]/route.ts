import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/booking/[id]
 * Get booking details by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                location: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                    },
                },
                room: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                payment: true,
            },
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            booking: {
                id: booking.id,
                bookingCode: booking.bookingCode,
                customerName: booking.customerName,
                customerPhone: booking.customerPhone,
                customerEmail: booking.customerEmail,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                guests: booking.guests,
                estimatedAmount: booking.estimatedAmount,
                depositAmount: booking.depositAmount,
                depositPaidAt: booking.depositPaidAt,
                status: booking.status,
                createdAt: booking.createdAt,
                paymentStartedAt: booking.paymentStartedAt, // For countdown calculation
                location: booking.location,
                room: booking.room,
                payment: booking.payment ? {
                    id: booking.payment.id,
                    method: booking.payment.method,
                    status: booking.payment.status,
                    amount: booking.payment.amount,
                } : null,
            },
        })
    } catch (error) {
        console.error('Error fetching booking:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
