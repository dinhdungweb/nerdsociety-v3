/**
 * Script fix remainingAmount cho các booking COMPLETED với depositStatus = WAIVED hoặc PENDING
 * Chạy: npx ts-node prisma/fix-remaining-amount.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Tìm các booking COMPLETED với depositStatus không phải PAID_ONLINE...')

    // Tìm các booking COMPLETED có depositStatus = WAIVED hoặc PENDING
    const bookingsToFix = await prisma.booking.findMany({
        where: {
            status: 'COMPLETED',
            depositStatus: {
                in: ['WAIVED', 'PENDING']
            },
            actualAmount: { not: null }
        }
    })

    console.log(`📊 Tìm thấy ${bookingsToFix.length} booking cần fix`)

    for (const booking of bookingsToFix) {
        // Với WAIVED hoặc PENDING, paidDeposit = 0
        // remainingAmount = actualAmount - 0 = actualAmount
        const correctRemainingAmount = booking.actualAmount!

        if (booking.remainingAmount !== correctRemainingAmount) {
            console.log(`\n📝 Booking ${booking.bookingCode}:`)
            console.log(`   - depositStatus: ${booking.depositStatus}`)
            console.log(`   - actualAmount: ${booking.actualAmount}`)
            console.log(`   - remainingAmount hiện tại: ${booking.remainingAmount}`)
            console.log(`   - remainingAmount đúng: ${correctRemainingAmount}`)
            console.log(`   - Chênh lệch: ${correctRemainingAmount - (booking.remainingAmount || 0)}`)

            await prisma.booking.update({
                where: { id: booking.id },
                data: { remainingAmount: correctRemainingAmount }
            })

            console.log(`   ✅ Đã fix!`)
        }
    }

    console.log('\n🎉 Hoàn thành fix data!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
