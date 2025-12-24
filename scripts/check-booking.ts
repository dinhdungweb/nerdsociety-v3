
import { prisma } from '../src/lib/prisma'

async function main() {
    const code = process.argv[2]
    if (!code) {
        console.error('Please provide a booking code')
        process.exit(1)
    }

    const booking = await prisma.booking.findUnique({
        where: { bookingCode: code },
        include: {
            payment: true,
        },
    })

    console.log(JSON.stringify(booking, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
