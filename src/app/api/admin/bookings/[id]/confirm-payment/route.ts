import { sendBookingEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { canBooking } from '@/lib/apiPermissions'

/**
 * POST /api/admin/bookings/[id]/confirm-payment
 * Admin confirms that payment has been received
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Permission check
        const { session, hasAccess } = await canBooking('Edit')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Unauthorized to confirm payments' }, { status: 403 })
        }

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                location: true,
                room: true,
                user: true,
            },
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        // Check if booking is in correct state
        if (booking.status !== 'PENDING') {
            return NextResponse.json(
                { error: 'Booking is not in PENDING status' },
                { status: 400 }
            )
        }

        // Update booking status to CONFIRMED and depositStatus to PAID_ONLINE
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
                depositStatus: 'PAID_ONLINE',
            },
            include: {
                location: true,
                room: true,
                user: true,
            },
        })

        // Update payment record if exists
        await prisma.payment.updateMany({
            where: { bookingId: id },
            data: {
                status: 'COMPLETED',
                paidAt: new Date(),
            },
        })

        // Send confirmation email to customer
        if (updatedBooking.customerEmail || updatedBooking.user?.email) {
            try {
                await sendBookingEmail(updatedBooking)
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError)
                // Don't fail the request if email fails
            }
        }

        // Audit logging
        if (session?.user) {
            await audit.confirmPayment(
                session.user.id || 'unknown',
                session.user.name || session.user.email || 'Admin',
                booking.id,
                { bookingCode: booking.bookingCode, customerName: booking.customerName }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed',
            booking: {
                id: updatedBooking.id,
                bookingCode: updatedBooking.bookingCode,
                status: updatedBooking.status,
            },
        })
    } catch (error) {
        console.error('Error confirming payment:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
