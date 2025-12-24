import { prisma } from '@/lib/prisma'
import { verifyVNPayReturn } from '@/lib/vnpay'
import { sendBookingEmail } from '@/lib/email'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const vnpParams: Record<string, string> = {}

        // Extract search params
        searchParams.forEach((value, key) => {
            vnpParams[key] = value
        })

        // Verify signature
        const isVerified = verifyVNPayReturn(vnpParams)
        if (!isVerified) {
            return Response.redirect(`${process.env.NEXTAUTH_URL}/booking/failed?error=signature`)
        }

        // Check payment status
        const rspCode = vnpParams['vnp_ResponseCode']
        const txnRef = vnpParams['vnp_TxnRef']

        // txnRef format: PREFIX-DATE-SUFFIX-TIMESTAMP, we likely want to find by bookingCode or the unique ID we stored
        // Actually we stored txnRef in payment.transactionId in the create-url step

        const payment = await prisma.payment.findFirst({
            where: { transactionId: txnRef },
            include: { booking: true },
        })

        if (!payment) {
            return Response.redirect(`${process.env.NEXTAUTH_URL}/booking/failed?error=not_found`)
        }

        const bookingId = payment.bookingId

        if (rspCode === '00') {
            // Success - Check idempotency first (booking might already be confirmed by IPN)
            const currentBooking = await prisma.booking.findUnique({
                where: { id: bookingId },
                select: { status: true }
            })

            // If already confirmed (by IPN), just redirect to success
            if (currentBooking?.status === 'CONFIRMED') {
                return Response.redirect(`${process.env.NEXTAUTH_URL}/booking/success?id=${bookingId}&payment=already_confirmed`)
            }

            const [_, updatedBooking] = await prisma.$transaction([
                prisma.payment.update({
                    where: { bookingId },
                    data: {
                        status: 'COMPLETED',
                        paidAt: new Date(),
                        gatewayData: vnpParams as unknown as Prisma.InputJsonValue,
                    },
                }),
                prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'CONFIRMED', // Auto confirm if paid
                        depositStatus: 'PAID_ONLINE',
                        depositPaidAt: new Date(),
                    },
                    include: {
                        user: true,
                        location: true,
                        room: true,
                    },
                }),
            ])

            sendBookingEmail(updatedBooking).catch(console.error)

            return Response.redirect(`${process.env.NEXTAUTH_URL}/booking/success?id=${bookingId}&payment=success`)
        } else {
            // Failed
            await prisma.payment.update({
                where: { bookingId },
                data: {
                    status: 'FAILED',
                    gatewayData: vnpParams as unknown as Prisma.InputJsonValue,
                },
            })

            return Response.redirect(`${process.env.NEXTAUTH_URL}/booking/failed?id=${bookingId}&error=payment_failed`)
        }
    } catch (error) {
        console.error('VNPay return error:', error)
        return Response.redirect(`${process.env.NEXTAUTH_URL}/booking/failed?error=internal`)
    }
}
