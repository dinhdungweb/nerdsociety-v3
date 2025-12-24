import { prisma } from '@/lib/prisma'
import { verifyVNPayReturn } from '@/lib/vnpay'
import { sendBookingEmail } from '@/lib/email'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const vnpParams: Record<string, string> = {}

        searchParams.forEach((value, key) => {
            vnpParams[key] = value
        })

        const isVerified = verifyVNPayReturn(vnpParams)

        if (!isVerified) {
            return NextResponse.json({ RspCode: '97', Message: 'Checksum failed' })
        }

        const rspCode = vnpParams['vnp_ResponseCode']
        const txnRef = vnpParams['vnp_TxnRef']
        const amount = parseInt(vnpParams['vnp_Amount']) / 100 // VNPay amount is * 100

        const payment = await prisma.payment.findFirst({
            where: { transactionId: txnRef },
        })

        if (!payment) {
            return NextResponse.json({ RspCode: '01', Message: 'Order not found' })
        }

        // Check amount
        if (payment.amount !== amount) {
            return NextResponse.json({ RspCode: '04', Message: 'Invalid amount' })
        }

        // Check if already processed
        if (payment.status === 'COMPLETED' && rspCode === '00') {
            return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' })
        }

        if (rspCode === '00') {
            const [_, updatedBooking] = await prisma.$transaction([
                prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'COMPLETED',
                        paidAt: new Date(),
                        gatewayData: vnpParams as unknown as Prisma.InputJsonValue,
                    },
                }),
                prisma.booking.update({
                    where: { id: payment.bookingId },
                    data: {
                        status: 'CONFIRMED',
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

            return NextResponse.json({ RspCode: '00', Message: 'Success' })
        } else {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'FAILED',
                    gatewayData: vnpParams as unknown as Prisma.InputJsonValue,
                },
            })

            return NextResponse.json({ RspCode: '00', Message: 'Success' }) // VNPay expects 00 even if payment failed logic wise, just acknowledging we processed it
        }

    } catch (error) {
        console.error('VNPay IPN error:', error)
        return NextResponse.json({ RspCode: '99', Message: 'Unknown error' })
    }
}
