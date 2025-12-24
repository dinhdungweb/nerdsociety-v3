import { prisma } from './prisma'
import { ServiceType } from '@prisma/client'

/**
 * System constants (không đổi thường xuyên)
 */
export const SYSTEM_CONFIG = {
    DEPOSIT_RATE: 0.5,           // Cọc 50%
    GRACE_PERIOD_MINUTES: 15,    // Thời gian ân hạn (phút) không tính phụ trội
    GUEST_THRESHOLD: 8,          // Ngưỡng số người cho Meeting Room
} as const

/**
 * Interface cho Service pricing từ database
 */
interface ServicePricing {
    priceSmall: number | null
    priceLarge: number | null
    priceFirstHour: number | null
    pricePerHour: number | null
    nerdCoinReward: number
}

/**
 * Cache service pricing để tránh query DB mỗi lần tính giá
 */
let servicePricingCache: Map<ServiceType, ServicePricing> | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 60000 // 1 phút

/**
 * Lấy pricing từ database theo service type
 */
export async function getServicePricing(serviceType: ServiceType): Promise<ServicePricing | null> {
    const now = Date.now()

    // Check cache
    if (servicePricingCache && (now - cacheTimestamp) < CACHE_TTL) {
        return servicePricingCache.get(serviceType) || null
    }

    // Fetch all services and cache
    const services = await prisma.service.findMany({
        where: { isActive: true },
        select: {
            type: true,
            priceSmall: true,
            priceLarge: true,
            priceFirstHour: true,
            pricePerHour: true,
            nerdCoinReward: true,
        }
    })

    servicePricingCache = new Map()
    for (const service of services) {
        servicePricingCache.set(service.type, {
            priceSmall: service.priceSmall,
            priceLarge: service.priceLarge,
            priceFirstHour: service.priceFirstHour,
            pricePerHour: service.pricePerHour,
            nerdCoinReward: service.nerdCoinReward,
        })
    }
    cacheTimestamp = now

    return servicePricingCache.get(serviceType) || null
}

/**
 * Invalidate cache khi admin update pricing
 */
export function invalidateServicePricingCache() {
    servicePricingCache = null
    cacheTimestamp = 0
}

/**
 * Tính giá Meeting Room từ database
 */
export async function calculateMeetingPriceFromDB(
    guests: number,
    durationMinutes: number
): Promise<number> {
    const pricing = await getServicePricing('MEETING')
    if (!pricing) {
        throw new Error('Meeting pricing not found in database')
    }

    const pricePerHour = guests >= SYSTEM_CONFIG.GUEST_THRESHOLD
        ? (pricing.priceLarge || 0)
        : (pricing.priceSmall || 0)

    const hours = durationMinutes / 60
    return Math.round(pricePerHour * hours)
}

/**
 * Tính giá Pod từ database
 * - Giờ đầu: giá cố định
 * - Từ giờ 2: tính theo phút
 */
export async function calculatePodPriceFromDB(
    type: 'POD_MONO' | 'POD_MULTI',
    durationMinutes: number
): Promise<number> {
    const pricing = await getServicePricing(type)
    if (!pricing) {
        throw new Error(`${type} pricing not found in database`)
    }

    const firstHour = pricing.priceFirstHour || 0
    const perHour = pricing.pricePerHour || 0

    if (durationMinutes <= 60) {
        return firstHour
    }

    const extraMinutes = durationMinutes - 60
    const extraHours = extraMinutes / 60
    return firstHour + Math.round(perHour * extraHours)
}

/**
 * Tính giá booking từ database
 */
export async function calculateBookingPriceFromDB(
    serviceType: ServiceType,
    durationMinutes: number,
    guests: number = 1
): Promise<number> {
    switch (serviceType) {
        case 'MEETING':
            return calculateMeetingPriceFromDB(guests, durationMinutes)
        case 'POD_MONO':
            return calculatePodPriceFromDB('POD_MONO', durationMinutes)
        case 'POD_MULTI':
            return calculatePodPriceFromDB('POD_MULTI', durationMinutes)
        default:
            throw new Error(`Unknown service type: ${serviceType}`)
    }
}

/**
 * Tính tiền cọc (50%)
 */
export function calculateDeposit(totalAmount: number): number {
    return Math.round(totalAmount * SYSTEM_CONFIG.DEPOSIT_RATE)
}

/**
 * Lấy số Nerd Coin reward từ database
 */
export async function getNerdCoinRewardFromDB(serviceType: ServiceType): Promise<number> {
    const pricing = await getServicePricing(serviceType)
    return pricing?.nerdCoinReward || 0
}

/**
 * Tính phụ trội (Surcharge) khi quá giờ - đọc từ database
 */
export async function calculateSurchargeFromDB(
    serviceType: ServiceType,
    actualDuration: number,
    scheduledDuration: number,
    guests: number = 1
): Promise<number> {
    const overtimeMinutes = actualDuration - scheduledDuration
    if (overtimeMinutes <= SYSTEM_CONFIG.GRACE_PERIOD_MINUTES) return 0

    const pricing = await getServicePricing(serviceType)
    if (!pricing) return 0

    if (serviceType === 'MEETING') {
        // Meeting: Làm tròn lên theo block 1h
        const overtimeHours = Math.ceil(overtimeMinutes / 60)
        const pricePerHour = guests >= SYSTEM_CONFIG.GUEST_THRESHOLD
            ? (pricing.priceLarge || 0)
            : (pricing.priceSmall || 0)
        return overtimeHours * pricePerHour
    }

    // Pod: Tính theo phút dựa trên giá giờ thứ 2 trở đi
    const extraHours = overtimeMinutes / 60
    return Math.round((pricing.pricePerHour || 0) * extraHours)
}

/**
 * Tạo breakdown chi tiết từ database
 */
export async function getPriceBreakdownFromDB(
    serviceType: ServiceType,
    durationMinutes: number,
    guests: number = 1
) {
    const pricing = await getServicePricing(serviceType)
    if (!pricing) {
        throw new Error(`${serviceType} pricing not found`)
    }

    const hours = durationMinutes / 60

    if (serviceType === 'MEETING') {
        const pricePerHour = guests >= SYSTEM_CONFIG.GUEST_THRESHOLD
            ? (pricing.priceLarge || 0)
            : (pricing.priceSmall || 0)
        return {
            type: 'MEETING',
            pricePerHour,
            hours,
            guestTier: guests >= SYSTEM_CONFIG.GUEST_THRESHOLD ? 'LARGE' : 'SMALL',
        }
    }

    return {
        type: serviceType,
        firstHourPrice: pricing.priceFirstHour || 0,
        perHourPrice: pricing.pricePerHour || 0,
        hours,
        extraMinutes: Math.max(0, durationMinutes - 60),
    }
}
