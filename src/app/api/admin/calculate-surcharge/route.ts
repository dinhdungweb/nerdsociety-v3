import { prisma } from '@/lib/prisma'
import { calculateSurchargeFromDB, SYSTEM_CONFIG } from '@/lib/pricing-db'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { parseISO, differenceInMinutes, format } from 'date-fns'
import { getBookingDateTime } from '@/lib/booking-utils'
import { canBooking } from '@/lib/apiPermissions'

// POST /api/admin/calculate-surcharge (requires canCheckOut permission)
export async function POST(req: Request) {
    try {
        const { session, hasAccess } = await canBooking('CheckOut')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền tính phụ phí' }, { status: 403 })
        }

        const body = await req.json()
        const { bookingId, checkOutTime } = body

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                room: { select: { type: true } },
            }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Parse scheduled times
        const scheduledStart = getBookingDateTime(booking.date, booking.startTime)
        const scheduledEnd = getBookingDateTime(booking.date, booking.endTime)
        const scheduledDuration = differenceInMinutes(scheduledEnd, scheduledStart)

        // Parse actual check-out time (default to now if not provided)
        const actualEnd = checkOutTime ? new Date(checkOutTime) : new Date()

        // Actual start time: use actualStartTime if available, otherwise scheduled start
        // Policy: If guest is late, we still count from scheduled start.
        // If guest is early (actualStart < scheduledStart), we might count from actualStart (optional, for now keep simple)
        const actualStart = booking.actualStartTime || scheduledStart

        // Duration used for surcharge calculation:
        // We compare Actual End vs Scheduled End
        // actualDuration = (Actual End - Scheduled Start)
        const actualDuration = differenceInMinutes(actualEnd, scheduledStart)

        let serviceType: any = 'MEETING'
        if (booking.room.type === 'POD_MONO') serviceType = 'POD_MONO'
        if (booking.room.type === 'POD_MULTI') serviceType = 'POD_MULTI'
        if (booking.room.type === 'MEETING_LONG' || booking.room.type === 'MEETING_ROUND') serviceType = 'MEETING'

        const surcharge = await calculateSurchargeFromDB(
            serviceType,
            actualDuration,
            scheduledDuration,
            booking.guests
        )

        // Recalculate total amount
        // Logic: Original Estimated Amount + Surcharge
        // (Alternatively: Recalculate full price based on actualDuration - but logic says Surcharge is better)
        const totalAmount = booking.estimatedAmount + surcharge

        // Only subtract deposit if actually paid (PAID_ONLINE or PAID_CASH, not WAIVED or PENDING)
        const isPaid = booking.depositStatus === 'PAID_ONLINE' || booking.depositStatus === 'PAID_CASH'
        const paidDeposit = isPaid ? booking.depositAmount : 0
        const remainingAmount = totalAmount - paidDeposit

        return NextResponse.json({
            surcharge,
            totalAmount,
            remainingAmount,
            scheduledEnd,
            actualEnd,
            overtimeMinutes: Math.max(0, actualDuration - scheduledDuration)
        })

    } catch (error) {
        console.error('Error calculating surcharge:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
