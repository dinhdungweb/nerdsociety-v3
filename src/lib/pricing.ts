import { ServiceType } from '@prisma/client'

/**
 * Pricing constants theo business logic Nerd Society
 */
export const PRICING = {
    MEETING: {
        SMALL: 80000,      // < 8 người: 80,000đ/giờ
        LARGE: 100000,     // 8-20 người: 100,000đ/giờ
        THRESHOLD: 8,      // Ngưỡng số người
    },
    POD_MONO: {
        FIRST_HOUR: 19000,    // Giờ đầu: 19,000đ
        PER_HOUR: 15000,      // Từ giờ 2: 15,000đ/giờ (tính phút)
        NERD_COIN: 1,
    },
    POD_MULTI: {
        FIRST_HOUR: 29000,    // Giờ đầu: 29,000đ
        PER_HOUR: 25000,      // Từ giờ 2: 25,000đ/giờ (tính phút)
        NERD_COIN: 2,
    },
    DEPOSIT_RATE: 0.5,           // Cọc 50%
    GRACE_PERIOD_MINUTES: 15,    // Thời gian ân hạn (phút) không tính phụ trội
} as const

/**
 * Tính giá Meeting Room
 * @param guests - Số người tham gia
 * @param durationMinutes - Thời gian (phút)
 */
export function calculateMeetingPrice(guests: number, durationMinutes: number): number {
    const pricePerHour = guests >= PRICING.MEETING.THRESHOLD
        ? PRICING.MEETING.LARGE
        : PRICING.MEETING.SMALL
    const hours = durationMinutes / 60
    return Math.round(pricePerHour * hours)
}

/**
 * Tính giá Pod (Mono hoặc Multi)
 * - Giờ đầu: giá cố định
 * - Từ giờ 2: tính theo phút
 * @param type - 'POD_MONO' | 'POD_MULTI'
 * @param durationMinutes - Thời gian (phút)
 */
export function calculatePodPrice(type: 'POD_MONO' | 'POD_MULTI', durationMinutes: number): number {
    const config = type === 'POD_MONO' ? PRICING.POD_MONO : PRICING.POD_MULTI

    if (durationMinutes <= 60) {
        // Chỉ tính giờ đầu
        return config.FIRST_HOUR
    }

    // Giờ đầu + các phút sau
    const extraMinutes = durationMinutes - 60
    const extraHours = extraMinutes / 60
    const extraPrice = Math.round(config.PER_HOUR * extraHours)

    return config.FIRST_HOUR + extraPrice
}

/**
 * Tính giá booking dựa trên service type
 */
export function calculateBookingPrice(
    serviceType: ServiceType,
    durationMinutes: number,
    guests: number = 1
): number {
    switch (serviceType) {
        case 'MEETING':
            return calculateMeetingPrice(guests, durationMinutes)
        case 'POD_MONO':
            return calculatePodPrice('POD_MONO', durationMinutes)
        case 'POD_MULTI':
            return calculatePodPrice('POD_MULTI', durationMinutes)
        default:
            throw new Error(`Unknown service type: ${serviceType}`)
    }
}

/**
 * Tính tiền cọc (50%)
 */
export function calculateDeposit(totalAmount: number): number {
    return Math.round(totalAmount * PRICING.DEPOSIT_RATE)
}

/**
 * Lấy số Nerd Coin reward theo service type
 */
export function getNerdCoinReward(serviceType: ServiceType): number {
    switch (serviceType) {
        case 'POD_MONO':
            return PRICING.POD_MONO.NERD_COIN
        case 'POD_MULTI':
            return PRICING.POD_MULTI.NERD_COIN
        case 'MEETING':
        default:
            return 0
    }
}

/**
 * Tạo breakdown chi tiết cho pricing
 */
export function getPriceBreakdown(
    serviceType: ServiceType,
    durationMinutes: number,
    guests: number = 1
) {
    const hours = durationMinutes / 60

    if (serviceType === 'MEETING') {
        const pricePerHour = guests >= PRICING.MEETING.THRESHOLD
            ? PRICING.MEETING.LARGE
            : PRICING.MEETING.SMALL
        return {
            type: 'MEETING',
            pricePerHour,
            hours,
            guestTier: guests >= PRICING.MEETING.THRESHOLD ? 'LARGE' : 'SMALL',
        }
    }

    const config = serviceType === 'POD_MONO' ? PRICING.POD_MONO : PRICING.POD_MULTI
    return {
        type: serviceType,
        firstHourPrice: config.FIRST_HOUR,
        perHourPrice: config.PER_HOUR,
        hours,
        extraMinutes: Math.max(0, durationMinutes - 60),
    }
}

/**
 * Tính phụ trội (Surcharge) khi quá giờ
 * Grace period: 15 phút
 */
export function calculateSurcharge(
    serviceType: ServiceType,
    actualDuration: number,
    scheduledDuration: number,
    guests: number = 1
): number {
    const overtimeMinutes = actualDuration - scheduledDuration
    if (overtimeMinutes <= PRICING.GRACE_PERIOD_MINUTES) return 0 // Grace period

    if (serviceType === 'MEETING') {
        // Meeting: Làm tròn lên theo block 1h
        const overtimeHours = Math.ceil(overtimeMinutes / 60)
        const pricePerHour = guests >= PRICING.MEETING.THRESHOLD
            ? PRICING.MEETING.LARGE
            : PRICING.MEETING.SMALL
        return overtimeHours * pricePerHour
    }

    // Pod: Tính theo phút dựa trên giá giờ thứ 2 trở đi
    const config = serviceType === 'POD_MONO' ? PRICING.POD_MONO : PRICING.POD_MULTI
    const extraHours = overtimeMinutes / 60
    return Math.round(config.PER_HOUR * extraHours)
}
