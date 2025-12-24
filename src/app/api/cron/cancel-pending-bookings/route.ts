import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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

        // Find and cancel PENDING bookings older than threshold
        const result = await prisma.booking.updateMany({
            where: {
                status: 'PENDING',
                depositStatus: 'PENDING',
                createdAt: {
                    lt: timeoutThreshold
                }
            },
            data: {
                status: 'CANCELLED',
                note: `Tự động hủy do không thanh toán cọc sau ${PENDING_TIMEOUT_MINUTES} phút`
            }
        })

        console.log(`[Cron] Auto-cancelled ${result.count} pending bookings`)

        return NextResponse.json({
            success: true,
            cancelled: result.count,
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
