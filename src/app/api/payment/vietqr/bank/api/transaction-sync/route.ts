import { sendBookingEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs' // đảm bảo chạy Node runtime (prisma/jwt)

type VietQRTransactionSyncPayload = {
    bankaccount?: string
    amount?: string | number
    transType?: string // D/C theo spec
    content?: string
    transactionid?: string
    transactiontime?: string | number // timestamp ms
    referencenumber?: string
    orderId?: string
    sign?: string
}

function jsonError(
    errorReason: string,
    toastMessage: string,
    status = 400
) {
    return NextResponse.json(
        { error: true, errorReason, toastMessage, object: null },
        { status }
    )
}

function jsonOk(toastMessage: string, reftransactionid = '') {
    return NextResponse.json({
        error: false,
        errorReason: null,
        toastMessage,
        object: { reftransactionid }
    })
}

/**
 * POST /api/payment/vietqr/bank/api/transaction-sync
 */
export async function POST(request: NextRequest) {
    try {
        const JWT_SECRET = process.env.VIETQR_WEBHOOK_SECRET
        if (!JWT_SECRET) {
            // Đừng fallback secret ở prod
            return jsonError('SERVER_MISCONFIG', 'Missing VIETQR_WEBHOOK_SECRET', 500)
        }

        // 0) Debug log
        const authHeader = request.headers.get('authorization')
        console.log('[VietQR Sync] INCOMING REQUEST ---------------------------')
        console.log('[VietQR Sync] Headers:', Object.fromEntries(request.headers))
        console.log('[VietQR Sync] Auth Header:', authHeader)

        // 1) Verify Bearer Token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // dùng E74 để VietQR dễ hiểu là token invalid
            return jsonError('E74', 'Authorization header is missing or invalid', 400)
        }

        const token = authHeader.split(' ')[1]
        try {
            jwt.verify(token, JWT_SECRET, { algorithms: ['HS512', 'HS256'] })
        } catch (err) {
            return jsonError('E74', 'Invalid or expired token', 400)
        }

        // 2) Parse body
        let body: VietQRTransactionSyncPayload
        try {
            body = (await request.json()) as VietQRTransactionSyncPayload
        } catch {
            return jsonError('INVALID_JSON', 'Body must be valid JSON', 400)
        }

        console.log('[VietQR Sync] Received:', JSON.stringify(body, null, 2))

        const {
            transactionid,
            amount,
            content,
            transType,
            transactiontime
        } = body

        if (!transactionid) {
            return jsonError('INVALID_PAYLOAD', 'Missing transactionid', 400)
        }

        // 3) Idempotency: nếu transactionid đã được ghi nhận -> OK luôn
        const existed = await prisma.payment.findFirst({
            where: { transactionId: transactionid },
            select: { id: true, bookingId: true }
        })

        if (existed) {
            console.log('[VietQR Sync] Idempotent hit - already processed:', transactionid)
            return jsonOk('Already processed', transactionid)
        }

        // 4) Only process credit transactions
        // Spec: transType D/C
        if (transType !== 'C') {
            console.log('[VietQR Sync] Ignored non-credit transaction:', transType)
            return jsonOk('Ignored non-credit transaction', transactionid)
        }

        // 5) Parse booking code from content
        // Content example: "... NERD 20251226 001"
        const bookingCodeMatch = (content || '').match(/NERD[- ]?(\d{8})[- ]?(\d{3})/i)
        if (!bookingCodeMatch) {
            console.log('[VietQR Sync] No booking code found in content:', content)
            return jsonOk('No booking code found in transfer content', transactionid)
        }

        const datePart = bookingCodeMatch[1]
        const seqPart = bookingCodeMatch[2]
        const extractedCode = `NERD-${datePart}-${seqPart}`

        console.log('[VietQR Sync] Extracted Code:', extractedCode)

        const transactionAmount = Number(amount)
        if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
            return jsonError('INVALID_AMOUNT', 'Invalid amount', 400)
        }

        const paidAt =
            transactiontime !== undefined && transactiontime !== null && String(transactiontime).trim() !== ''
                ? new Date(Number(transactiontime))
                : new Date()

        if (Number.isNaN(paidAt.getTime())) {
            // nếu transactiontime sai format thì fallback now
            console.log('[VietQR Sync] Invalid transactiontime, fallback now:', transactiontime)
        }

        const finalPaidAt = Number.isNaN(paidAt.getTime()) ? new Date() : paidAt

        // 6) Find booking
        const booking = await prisma.booking.findFirst({
            where: {
                bookingCode: extractedCode,
                status: 'PENDING',
                depositPaidAt: null
            },
            include: { user: true }
        })

        if (!booking) {
            console.log('[VietQR Sync] Booking not found or already paid:', extractedCode)
            return jsonOk('Booking not found or already paid', transactionid)
        }

        // 7) Optional amount check (log only)
        if (transactionAmount < booking.depositAmount) {
            console.log('[VietQR Sync] Amount is lower than depositAmount:', {
                received: transactionAmount,
                expected: booking.depositAmount
            })
            // tuỳ policy: reject hay vẫn confirm
            // hiện tại vẫn confirm để không làm kẹt UX, nhưng bạn có thể đổi sang error nếu muốn
        }

        // 8) Update DB (transaction)
        await prisma.$transaction([
            prisma.booking.update({
                where: { id: booking.id },
                data: {
                    status: 'CONFIRMED',
                    depositPaidAt: finalPaidAt
                }
            }),
            prisma.payment.updateMany({
                where: { bookingId: booking.id },
                data: {
                    status: 'COMPLETED',
                    transactionId: transactionid,
                    paidAt: finalPaidAt,
                    amount: transactionAmount
                }
            })
        ])

        // 9) Send email (best-effort)
        const emailRecipient = booking.customerEmail || booking.user?.email
        if (emailRecipient) {
            try {
                const fullBooking = await prisma.booking.findUnique({
                    where: { id: booking.id },
                    include: { location: true, room: true, user: true }
                })
                if (fullBooking) await sendBookingEmail(fullBooking)
            } catch (emailError) {
                console.error('[VietQR Sync] Email error:', emailError)
            }
        }

        return jsonOk('Transaction processed successfully', transactionid)
    } catch (error) {
        console.error('[VietQR Sync] Fatal error:', error)
        // E05: Unknown error
        return NextResponse.json(
            { error: true, errorReason: 'E05', toastMessage: 'Internal Server Error', object: null },
            { status: 500 }
        )
    }
}
