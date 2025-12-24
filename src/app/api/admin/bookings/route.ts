import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { calculateBookingPriceFromDB, calculateDeposit, SYSTEM_CONFIG } from '@/lib/pricing-db'
import { isSlotAvailable, generateBookingCode, getBookingDateTime, parseTimeToMinutes, OPERATING_HOURS } from '@/lib/booking-utils'
import { parseISO, addMinutes, format } from 'date-fns'
import { audit } from '@/lib/audit'
import { canView, canBooking } from '@/lib/apiPermissions'

// GET /api/admin/bookings - Get all bookings (requires canViewBookings permission)
export async function GET() {
    try {
        const { session, hasAccess } = await canView('Bookings')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem bookings' }, { status: 403 })
        }

        const bookings = await prisma.booking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                location: { select: { name: true } },
                room: { select: { name: true, type: true } },
                payment: { select: { status: true, method: true } },
            },
        })

        // Transform bookings for backward compatibility with frontend
        const transformedBookings = bookings.map(b => ({
            ...b,
            // Map room to combo-like structure for existing frontend
            combo: b.room ? { name: b.room.name, duration: 60 } : null,
            // Use customerName or user.name for display
            user: {
                name: b.customerName || b.user?.name || 'N/A',
                email: b.customerEmail || b.user?.email || '',
                phone: b.customerPhone || b.user?.phone || '',
            },
            // Map estimatedAmount to totalAmount for backward compat
            totalAmount: b.estimatedAmount,
        }))

        return NextResponse.json(transformedBookings)
    } catch (error) {
        console.error('Error fetching bookings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST /api/admin/bookings - Create Walk-in Booking (requires canCreateBookings permission)
export async function POST(req: Request) {
    try {
        const { session, hasAccess } = await canBooking('Create')

        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền tạo booking' }, { status: 403 })
        }

        const body = await req.json()
        const {
            roomId,
            date, // ISO Date string
            startTime, // "HH:mm"
            durationMinutes,
            customerName,
            customerPhone,
            customerEmail,
            depositStatus, // 'PAID_CASH' | 'WAIVED'
            note
        } = body

        // 1. Validation
        if (!roomId || !date || !startTime || !durationMinutes || !customerName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 2. Pricing
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: { location: true }
        })
        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

        // Map Room Type to Service Type
        let serviceType: any = 'MEETING'
        if (room.type === 'POD_MONO') serviceType = 'POD_MONO'
        if (room.type === 'POD_MULTI') serviceType = 'POD_MULTI'

        let finalAmount = await calculateBookingPriceFromDB(serviceType, durationMinutes, 1)
        if (serviceType === 'MEETING' && body.guests) {
            finalAmount = await calculateBookingPriceFromDB('MEETING', durationMinutes, body.guests)
        }

        const depositAmount = calculateDeposit(finalAmount)
        const bookingCode = await generateBookingCode(new Date(date))

        // 3. Validation: Past booking, Operating hours, Min duration
        const now = new Date()
        const startDateTime = getBookingDateTime(date, startTime)
        const endDateTime = addMinutes(startDateTime, durationMinutes)

        // Admin: Allow booking in past for backfill (optional - uncomment to block)
        // if (startDateTime < now) {
        //     return NextResponse.json({ error: 'Không thể đặt lịch trong quá khứ' }, { status: 400 })
        // }

        // Operating hours check
        const startMinutes = parseTimeToMinutes(startTime)
        const endMinutes = parseTimeToMinutes(format(endDateTime, 'HH:mm'))
        const openMinutes = parseTimeToMinutes(OPERATING_HOURS.open)
        const closeMinutes = parseTimeToMinutes(OPERATING_HOURS.close)

        if (startMinutes < openMinutes || endMinutes > closeMinutes) {
            return NextResponse.json(
                { error: `Giờ hoạt động từ ${OPERATING_HOURS.open} đến ${OPERATING_HOURS.close}` },
                { status: 400 }
            )
        }

        // Minimum duration (60 minutes)
        if (durationMinutes < 60) {
            return NextResponse.json(
                { error: 'Thời lượng tối thiểu là 60 phút' },
                { status: 400 }
            )
        }

        const conflict = await prisma.booking.findFirst({
            where: {
                roomId,
                date: new Date(date),
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
                OR: [
                    {
                        startTime: { lte: startTime },
                        endTime: { gt: startTime }
                    },
                    {
                        startTime: { lt: format(endDateTime, 'HH:mm') },
                        endTime: { gte: format(endDateTime, 'HH:mm') }
                    },
                    {
                        startTime: { gte: startTime },
                        endTime: { lte: format(endDateTime, 'HH:mm') }
                    }
                ]
            }
        })

        if (conflict) {
            return NextResponse.json({
                error: `Phòng đã bị đặt trong khung giờ này (Trùng với booking ${conflict.bookingCode})`
            }, { status: 409 })
        }

        const endTime = format(endDateTime, 'HH:mm')

        // 4. Create Booking
        const booking = await prisma.booking.create({
            data: {
                bookingCode,
                roomId,
                locationId: room.locationId,
                date: new Date(date),
                startTime,
                endTime,
                guests: body.guests || 1,
                customerName,
                customerPhone,
                customerEmail,
                source: 'ONSITE',
                status: depositStatus === 'PAID_CASH' || depositStatus === 'WAIVED' ? 'CONFIRMED' : 'PENDING',
                estimatedAmount: finalAmount,
                depositAmount: depositAmount,
                depositStatus: depositStatus === 'PAID_CASH' ? 'PAID_CASH' : (depositStatus === 'WAIVED' ? 'WAIVED' : 'PENDING'),
                depositPaidAt: depositStatus === 'PAID_CASH' ? new Date() : null,
                note,
                nerdCoinIssued: 0,
            }
        })

        // 5. Create Payment record if Cash paid
        if (depositStatus === 'PAID_CASH') {
            await prisma.payment.create({
                data: {
                    bookingId: booking.id,
                    amount: depositAmount,
                    method: 'CASH',
                    status: 'COMPLETED',
                    paidAt: new Date()
                }
            })
        }

        // Create notification for new booking created by staff
        import('@/lib/notifications').then(({ notifyNewBooking }) => {
            notifyNewBooking(booking.bookingCode, customerName, booking.id).catch(console.error)
        })

        // Audit logging
        await audit.create(
            session.user.id || 'unknown',
            session.user.name || session.user.email || 'Admin',
            'booking',
            booking.id,
            { bookingCode: booking.bookingCode, customerName, source: 'ONSITE' }
        )

        return NextResponse.json(booking)

    } catch (error) {
        console.error('Error creating walk-in booking:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
