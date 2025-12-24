import { sendBookingEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { verifyVietQRWebhook } from '@/lib/vietqr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/payment/vietqr/webhook
 * 
 * VietQR Transaction Sync Webhook
 * Called by VietQR when a payment is received
 * 
 * Expected payload (from VietQR):
 * {
 *   "code": "00",
 *   "desc": "Success",
 *   "data": {
 *     "orderId": "NERD-20241216-001",
 *     "amount": 100000,
 *     "transactionId": "FT24350xxxxx",
 *     "transactionTime": "2024-12-16 10:30:00",
 *     "bankCode": "MB",
 *     "accountNumber": "xxxx"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Log for debugging
        console.log('[VietQR Webhook] Received:', JSON.stringify(body, null, 2))

        // Verify webhook signature (if using secret)
        const signature = request.headers.get('x-vietqr-signature')
        if (!verifyVietQRWebhook(body, signature)) {
            console.error('[VietQR Webhook] Invalid signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        // Extract data from VietQR payload
        const { code, data } = body

        // Check if success
        if (code !== '00') {
            console.log('[VietQR Webhook] Non-success code:', code)
            return NextResponse.json({ success: true, message: 'Acknowledged' })
        }

        // Get transaction details
        const { amount, transactionId } = data

        // Parse orderId from description (format: "Thanh toan NERD-XXXXXXXX-XXX")
        const description = data.content || data.addInfo || data.description || ''
        const bookingCodeMatch = description.match(/NERD-\d{8}-\d{3}/i)

        if (!bookingCodeMatch) {
            console.log('[VietQR Webhook] No booking code found in description:', description)
            return NextResponse.json({ success: true, message: 'No matching booking' })
        }

        const bookingCode = bookingCodeMatch[0].toUpperCase()

        // Find booking by code
        const booking = await prisma.booking.findFirst({
            where: {
                bookingCode,
                status: 'PENDING',
                depositPaidAt: null,
            },
            include: {
                location: true,
                room: true,
            },
        })

        if (!booking) {
            console.log('[VietQR Webhook] Booking not found or already paid:', bookingCode)
            return NextResponse.json({ success: true, message: 'Booking not found or already paid' })
        }

        // Verify amount matches deposit
        if (amount < booking.depositAmount) {
            console.log('[VietQR Webhook] Amount mismatch:', { received: amount, expected: booking.depositAmount })
            // Still update but log the discrepancy
        }

        // Update booking and payment statuses in an atomic transaction
        const [updatedBooking] = await prisma.$transaction([
            prisma.booking.update({
                where: { id: booking.id },
                data: {
                    status: 'CONFIRMED',
                    depositPaidAt: new Date(),
                },
                include: {
                    location: true,
                    room: true,
                    user: true,
                },
            }),
            prisma.payment.updateMany({
                where: { bookingId: booking.id },
                data: {
                    status: 'COMPLETED',
                    transactionId,
                    paidAt: new Date(),
                },
            })
        ])

        console.log('[VietQR Webhook] Booking confirmed:', bookingCode)

        // Send confirmation email
        if (updatedBooking.customerEmail) {
            try {
                await sendBookingEmail(updatedBooking)
            } catch (emailError) {
                console.error('[VietQR Webhook] Error sending email:', emailError)
            }
        }

        // Return 200 OK to acknowledge receipt
        return NextResponse.json({
            success: true,
            message: 'Payment confirmed',
            bookingCode,
        })
    } catch (error) {
        console.error('[VietQR Webhook] Error:', error)
        // Still return 200 to prevent VietQR from retrying
        return NextResponse.json({
            success: false,
            error: 'Internal error',
        })
    }
}
