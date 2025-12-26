import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { calculateSurchargeFromDB, getNerdCoinRewardFromDB } from '@/lib/pricing-db'
import { differenceInMinutes, parseISO } from 'date-fns'
import { getBookingDateTime } from '@/lib/booking-utils'
import { sendBookingCancelledEmail } from '@/lib/email'
import { audit } from '@/lib/audit'
import { notifyBookingCancelled, notifyCheckIn, notifyCheckOut } from '@/lib/notifications'
import { canBooking, checkApiPermission } from '@/lib/apiPermissions'

// POST /api/admin/bookings/[id]/status (requires canCheckIn/canCheckOut/canEditBookings permission)
export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params
        const body = await req.json()
        const { action } = body // 'CHECK_IN' | 'CHECK_OUT' | 'CANCEL'

        if (!id) {
            return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })
        }

        // Check permission based on action
        const role = session.user.role as string
        if (action === 'CHECK_IN') {
            const { hasAccess } = await canBooking('CheckIn')
            if (!hasAccess) {
                return NextResponse.json({ error: 'Không có quyền check-in' }, { status: 403 })
            }
        } else if (action === 'CHECK_OUT') {
            const { hasAccess } = await canBooking('CheckOut')
            if (!hasAccess) {
                return NextResponse.json({ error: 'Không có quyền check-out' }, { status: 403 })
            }
        } else if (action === 'CANCEL') {
            const { hasAccess } = await canBooking('Edit')
            if (!hasAccess) {
                return NextResponse.json({ error: 'Không có quyền hủy booking' }, { status: 403 })
            }
        }

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                room: true
            }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        const now = new Date()

        if (action === 'CHECK_IN') {
            if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
                return NextResponse.json({ error: 'Invalid status for check-in' }, { status: 400 })
            }

            // Warning if no deposit paid (PENDING status usually means no deposit)
            const hasDeposit = booking.depositStatus === 'PAID_ONLINE' || booking.depositStatus === 'PAID_CASH'

            // Logic Check-in
            // Determine Service Type for Nerd Coin
            let serviceType: any = 'MEETING'
            if (booking.room.type === 'POD_MONO') serviceType = 'POD_MONO'
            if (booking.room.type === 'POD_MULTI') serviceType = 'POD_MULTI'

            const nerdCoins = await getNerdCoinRewardFromDB(serviceType)

            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: 'IN_PROGRESS',
                    actualStartTime: now,
                    // Issue Nerd Coin
                    nerdCoinIssued: nerdCoins,
                    nerdCoinIssuedAt: nerdCoins > 0 ? now : null
                }
            })

            // Credit Nerd Coins to customer's wallet if coins > 0 and user has account
            if (nerdCoins > 0 && booking.userId) {
                await prisma.$transaction([
                    // Create transaction record
                    prisma.nerdCoinTransaction.create({
                        data: {
                            userId: booking.userId,
                            amount: nerdCoins,
                            type: 'EARN',
                            description: `Booking #${booking.bookingCode}`,
                            bookingId: booking.id,
                        }
                    }),
                    // Update user balance
                    prisma.user.update({
                        where: { id: booking.userId },
                        data: {
                            nerdCoinBalance: { increment: nerdCoins },
                        }
                    })
                ])

                // Update tier after balance change
                const user = await prisma.user.findUnique({
                    where: { id: booking.userId },
                    select: { nerdCoinBalance: true }
                })
                if (user) {
                    let newTier = 'BRONZE'
                    if (user.nerdCoinBalance >= 100) newTier = 'GOLD'
                    else if (user.nerdCoinBalance >= 50) newTier = 'SILVER'

                    await prisma.user.update({
                        where: { id: booking.userId },
                        data: { nerdCoinTier: newTier }
                    })
                }
            }

            // Create notification for check-in
            // Create notification for check-in
            notifyCheckIn(booking.bookingCode, booking.customerName || 'Khách', booking.id).catch(console.error)

            // Audit logging
            await audit.checkIn(
                session.user.id || 'unknown',
                session.user.name || session.user.email || 'Admin',
                booking.id,
                { bookingCode: booking.bookingCode, customerName: booking.customerName }
            )

            return NextResponse.json({
                ...updatedBooking,
                nerdCoinIssued: nerdCoins,
                warning: !hasDeposit ? 'Khách chưa thanh toán cọc. Vui lòng thu tiền tại quầy.' : null
            })
        }

        if (action === 'CHECK_OUT') {
            if (booking.status !== 'IN_PROGRESS') {
                return NextResponse.json({ error: 'Invalid status for check-out' }, { status: 400 })
            }

            // Logic Check-out
            // 1. Calculate Surcharge
            const scheduledStart = getBookingDateTime(booking.date, booking.startTime)
            const scheduledEnd = getBookingDateTime(booking.date, booking.endTime)
            const scheduledDuration = differenceInMinutes(scheduledEnd, scheduledStart)

            // Use actualStartTime or scheduledStart
            const actualStart = booking.actualStartTime || scheduledStart
            const actualDuration = differenceInMinutes(now, scheduledStart) // Always verify against scheduled start for surcharge

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

            const actualAmount = booking.estimatedAmount + surcharge

            // Only deduct deposit if actually paid (PAID_ONLINE or PAID_CASH, not WAIVED or PENDING)
            const isPaid = booking.depositStatus === 'PAID_ONLINE' || booking.depositStatus === 'PAID_CASH'
            const paidDeposit = isPaid ? booking.depositAmount : 0
            const remainingAmount = actualAmount - paidDeposit

            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    actualEndTime: now,
                    actualAmount: actualAmount,
                    remainingAmount: remainingAmount,
                    // Assuming payment of remaining amount happens immediately via Cash/Sapo
                    // Ideally we should record a separate Payment transaction, but for simplicity we assume settled if 0 or Staff handled it.
                }
            })

            // Create notification for check-out
            // Create notification for check-out
            notifyCheckOut(booking.bookingCode, booking.customerName || 'Khách', booking.id).catch(console.error)

            // Audit logging
            await audit.checkOut(
                session.user.id || 'unknown',
                session.user.name || session.user.email || 'Admin',
                booking.id,
                { bookingCode: booking.bookingCode, customerName: booking.customerName, surcharge }
            )

            return NextResponse.json({ ...updatedBooking, surcharge })
        }

        if (action === 'CANCEL') {
            // Idempotency Check: IF booking is already cancelled, just return success
            if (booking.status === 'CANCELLED') {
                return NextResponse.json(booking)
            }

            const adminName = session.user.name || session.user.email || 'Admin'
            const cancellationNote = `Hủy bởi Admin ${adminName} lúc ${now.toLocaleString('vi-VN')}`

            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                    note: booking.note ? `${booking.note}\n---\n${cancellationNote}` : cancellationNote
                }
            })

            // Create notification for booking cancelled
            notifyBookingCancelled(booking.bookingCode, booking.customerName || 'Khách', booking.id).catch(console.error)

            // Send cancellation email to customer
            sendBookingCancelledEmail({
                ...booking,
                status: 'CANCELLED'
            }).catch(console.error)

            // Audit logging
            await audit.cancel(
                session.user.id || 'unknown',
                session.user.name || session.user.email || 'Admin',
                'booking',
                booking.id,
                { bookingCode: booking.bookingCode, customerName: booking.customerName }
            )

            return NextResponse.json(updatedBooking)
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error) {
        console.error('Error updating booking status:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
