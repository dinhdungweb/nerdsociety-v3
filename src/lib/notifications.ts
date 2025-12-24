import { prisma } from '@/lib/prisma'
import { triggerNotification } from '@/lib/pusher-server'

type NotificationType =
    | 'BOOKING_NEW'
    | 'BOOKING_CONFIRMED'
    | 'BOOKING_CANCELLED'
    | 'PAYMENT_RECEIVED'
    | 'CHECKIN'
    | 'CHECKOUT'
    | 'SYSTEM'

interface CreateNotificationParams {
    type: NotificationType
    title: string
    message: string
    link?: string
    bookingId?: string
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
                bookingId: params.bookingId,
            },
        })

        // Trigger real-time notification via Pusher
        await triggerNotification({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            createdAt: notification.createdAt,
        })

        return notification
    } catch (error) {
        console.error('Error creating notification:', error)
        return null
    }
}

// Shorthand functions for common notifications
export async function notifyNewBooking(bookingCode: string, customerName: string, bookingId: string) {
    return createNotification({
        type: 'BOOKING_NEW',
        title: 'Booking mới',
        message: `${customerName} vừa đặt phòng #${bookingCode}`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

export async function notifyBookingConfirmed(bookingCode: string, customerName: string, bookingId: string) {
    return createNotification({
        type: 'BOOKING_CONFIRMED',
        title: 'Booking đã xác nhận',
        message: `Booking #${bookingCode} của ${customerName} đã được xác nhận`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

export async function notifyPaymentReceived(bookingCode: string, amount: number, bookingId: string) {
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    return createNotification({
        type: 'PAYMENT_RECEIVED',
        title: 'Thanh toán thành công',
        message: `Nhận ${formattedAmount} cho booking #${bookingCode}`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

export async function notifyCheckIn(bookingCode: string, customerName: string, bookingId: string) {
    return createNotification({
        type: 'CHECKIN',
        title: 'Khách check-in',
        message: `${customerName} đã check-in (${bookingCode})`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

export async function notifyCheckOut(bookingCode: string, customerName: string, bookingId: string) {
    return createNotification({
        type: 'CHECKOUT',
        title: 'Khách check-out',
        message: `${customerName} đã check-out (${bookingCode})`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

export async function notifyOvertime(bookingCode: string, customerName: string, roomName: string, overtimeMinutes: number, bookingId: string) {
    return createNotification({
        type: 'SYSTEM',
        title: 'Khách quá giờ!',
        message: `${customerName} tại ${roomName} đã quá giờ ${overtimeMinutes} phút (${bookingCode})`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

export async function notifyEndingSoon(bookingCode: string, customerName: string, roomName: string, minutesLeft: number, bookingId: string) {
    return createNotification({
        type: 'SYSTEM',
        title: 'Sắp hết giờ',
        message: `${customerName} tại ${roomName} còn ${minutesLeft} phút (${bookingCode})`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

export async function notifyBookingCancelled(bookingCode: string, customerName: string, bookingId: string) {
    return createNotification({
        type: 'BOOKING_CANCELLED',
        title: 'Booking đã hủy',
        message: `Booking #${bookingCode} của ${customerName} đã bị hủy`,
        link: `/admin/bookings?id=${bookingId}`,
        bookingId,
    })
}

