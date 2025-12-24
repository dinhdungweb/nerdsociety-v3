import { authOptions } from '@/lib/auth'
import { sendBookingEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { bookingId } = await req.json()

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
        }

        // Find booking and verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { payment: true },
        })

        if (!booking || booking.userId !== session.user.id) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Update payment method to CASH and confirm booking
        await prisma.$transaction([
            prisma.payment.update({
                where: { bookingId },
                data: {
                    method: 'CASH',
                    status: 'PENDING', // Still pending until paid at counter
                },
            }),
            prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CONFIRMED', // Confirm booking, payment will be collected at counter
                    depositStatus: 'WAIVED', // Waived deposit for cash payment
                },
            }),
        ])

        // Fetch updated booking to send email
        const updatedBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                location: true,
                room: true,
                payment: true,
            },
        })

        if (updatedBooking) {
            await sendBookingEmail(updatedBooking)
        }

        return NextResponse.json({ success: true, message: 'Đặt lịch thành công! Vui lòng thanh toán tại quầy.' })
    } catch (error) {
        console.error('Cash payment error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

