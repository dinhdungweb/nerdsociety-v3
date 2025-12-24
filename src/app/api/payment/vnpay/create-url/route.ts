import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateVNPayUrl } from '@/lib/vnpay'
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
            return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                payment: true,
                room: true,
            },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        if (booking.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // IP Address handling
        // In production/Vercel, we might need a different way to get IP
        // For now, use a fallback
        const ipAddr = req.headers.get('x-forwarded-for') || '127.0.0.1'

        // Use booking code (without prefix maybe?) as orderId mostly needs to be unique
        // VNPay TxnRef must be unique for every request. If user retries payment, we might need a suffix.
        const orderId = `${booking.bookingCode}-${Date.now()}`

        const paymentUrl = generateVNPayUrl({
            amount: booking.depositAmount,
            orderId: orderId, // Use unique ref
            orderInfo: `Dat coc booking ${booking.bookingCode}`,
            ipAddr: ipAddr.split(',')[0].trim(),
        })

        // Update payment record with txn ref to track
        await prisma.payment.update({
            where: { bookingId: booking.id },
            data: {
                method: 'VNPAY',
                transactionId: orderId, // Temporary store orderId as transactionId until actual payment
            },
        })

        return NextResponse.json({ paymentUrl })
    } catch (error) {
        console.error('VNPay create error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

