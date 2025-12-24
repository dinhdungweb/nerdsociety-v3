import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { differenceInMinutes } from 'date-fns'

const RESCHEDULE_BEFORE_MINUTES = 60 // Cho phép đổi lịch trước 60 phút

/**
 * POST /api/booking/[id]/reschedule
 * Customer reschedules their own booking (before 60 minutes of start time)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { newDate, newStartTime, newEndTime } = body

        if (!newDate || !newStartTime || !newEndTime) {
            return NextResponse.json({
                error: 'Vui lòng chọn ngày và giờ mới'
            }, { status: 400 })
        }

        // Get booking
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { room: true },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Check ownership
        if (booking.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not your booking' }, { status: 403 })
        }

        // Check if can reschedule (only CONFIRMED bookings)
        if (booking.status !== 'CONFIRMED') {
            return NextResponse.json({
                error: 'Chỉ có thể đổi lịch booking đã xác nhận'
            }, { status: 400 })
        }

        // Check time - must be at least 60 minutes before current start
        const currentStart = new Date(booking.date)
        const [hours, minutes] = booking.startTime.split(':').map(Number)
        currentStart.setHours(hours, minutes, 0, 0)

        const now = new Date()
        const minutesToStart = differenceInMinutes(currentStart, now)

        if (minutesToStart < RESCHEDULE_BEFORE_MINUTES) {
            return NextResponse.json({
                error: `Chỉ có thể đổi lịch trước ${RESCHEDULE_BEFORE_MINUTES} phút. Vui lòng liên hệ staff.`
            }, { status: 400 })
        }

        // Check if new slot is available
        const newDateObj = new Date(newDate)
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                roomId: booking.roomId,
                date: newDateObj,
                status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
                id: { not: booking.id },
                OR: [
                    // New booking overlaps with existing
                    {
                        startTime: { lt: newEndTime },
                        endTime: { gt: newStartTime },
                    },
                ],
            },
        })

        if (conflictingBooking) {
            return NextResponse.json({
                error: 'Khung giờ này đã có người đặt. Vui lòng chọn khung giờ khác.'
            }, { status: 409 })
        }

        // Update booking
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                date: newDateObj,
                startTime: newStartTime,
                endTime: newEndTime,
                note: `${booking.note || ''}\n[Đổi lịch từ ${booking.date.toLocaleDateString('vi-VN')} ${booking.startTime} lúc ${now.toLocaleString('vi-VN')}]`.trim(),
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Đổi lịch thành công',
            booking: {
                id: updatedBooking.id,
                bookingCode: updatedBooking.bookingCode,
                date: updatedBooking.date,
                startTime: updatedBooking.startTime,
                endTime: updatedBooking.endTime,
            },
        })
    } catch (error) {
        console.error('Error rescheduling booking:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
