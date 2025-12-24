import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { sendCheckinReminderEmail } from '@/lib/email'
import { addHours, startOfDay, format } from 'date-fns'

// This cron job sends check-in reminder emails 1 hour before booking time
// Should be called every 15 minutes or so via Vercel Cron or external service

export async function GET(request: Request) {
    try {
        // Verify cron secret (optional but recommended for production)
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const today = startOfDay(now)

        // Find confirmed bookings for today that haven't been sent a reminder yet
        // And their start time is within the next 1-2 hours
        const bookings = await prisma.booking.findMany({
            where: {
                date: today,
                status: 'CONFIRMED',
                // Use a custom field to track if reminder was sent (we'll add this logic below)
            },
            include: {
                user: { select: { email: true, name: true } },
                room: { select: { name: true } },
                location: { select: { name: true, address: true } },
            },
        })

        const emailsSent: string[] = []

        for (const booking of bookings) {
            // Parse booking start time
            const [hours, minutes] = booking.startTime.split(':').map(Number)
            const bookingStartTime = new Date(today)
            bookingStartTime.setHours(hours, minutes, 0, 0)

            // Calculate time until booking
            const minutesUntilBooking = (bookingStartTime.getTime() - now.getTime()) / (1000 * 60)

            // Send reminder if booking is 45-75 minutes away (1 hour window)
            // This ensures we don't spam if cron runs multiple times
            if (minutesUntilBooking >= 45 && minutesUntilBooking <= 75) {
                try {
                    await sendCheckinReminderEmail(booking)
                    emailsSent.push(booking.bookingCode)
                    console.log(`✅ Sent check-in reminder for ${booking.bookingCode}`)
                } catch (error) {
                    console.error(`❌ Failed to send reminder for ${booking.bookingCode}:`, error)
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${emailsSent.length} check-in reminders`,
            bookings: emailsSent,
            checkedAt: now.toISOString(),
        })

    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
