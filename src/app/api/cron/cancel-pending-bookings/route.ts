import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendBookingCancelledEmail } from '@/lib/email'

// Configuration
const PENDING_TIMEOUT_MINUTES = 5 // Hủy booking PENDING sau 5 phút

/**
 * GET /api/cron/cancel-pending-bookings
 * Cron job: Auto-cancel PENDING bookings older than 5 minutes
 * 
 * This endpoint should be called by Vercel Cron or external cron service
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret (optional but recommended for security)
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const timeoutThreshold = new Date()
        timeoutThreshold.setMinutes(timeoutThreshold.getMinutes() - PENDING_TIMEOUT_MINUTES)

        // 1. Find PENDING bookings older than threshold
        const pendingBookings = await prisma.booking.findMany({
            where: {
                status: 'PENDING',
                depositStatus: 'PENDING',
                createdAt: {
                    lt: timeoutThreshold
                }
            },
            include: {
                user: true,
                location: true,
                room: true
            }
        })

        // 2. Cancel bookings and send emails
        let cancelledCount = 0

        for (const booking of pendingBookings) {
            try {
                // Update stats
                const cancellationNote = `Tự động hủy do không thanh toán cọc sau ${PENDING_TIMEOUT_MINUTES} phút`
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: 'CANCELLED',
                        note: booking.note ? `${booking.note}\n---\n${cancellationNote}` : cancellationNote
                    }
                })

                // Send Email to Customer
                await sendBookingCancelledEmail(booking)

                cancelledCount++
            } catch (err) {
                console.error(`[Cron] Error cancelling booking ${booking.id}:`, err)
            }
        }

        console.log(`[Cron] Auto-cancelled ${cancelledCount} pending bookings`)

        return NextResponse.json({
            success: true,
            cancelled: cancelledCount,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[Cron] Error cancelling pending bookings:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
