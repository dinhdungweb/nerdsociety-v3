/**
 * VietQR Payment Integration
 * Generates QR codes for bank transfers using VietQR.io
 * 
 * For auto-verification, register at: https://vietqr.vn
 * Supported banks: https://api.vietqr.io/v2/banks
 */

import crypto from 'crypto'

// Common bank codes
export const BANK_CODES = {
    VIETCOMBANK: 'VCB',
    TECHCOMBANK: 'TCB',
    MBBANK: 'MB',
    TPBANK: 'TPB',
    BIDV: 'BIDV',
    AGRIBANK: 'VBA',
    ACB: 'ACB',
    VPBANK: 'VPB',
    SACOMBANK: 'STB',
    VIETINBANK: 'ICB',
} as const

export type BankCode = typeof BANK_CODES[keyof typeof BANK_CODES]

interface VietQRConfig {
    bankCode: string
    accountNumber: string
    accountName: string
    template?: 'compact' | 'compact2' | 'qr_only' | 'print'
    // API credentials for auto-verification
    clientId?: string
    apiKey?: string
    webhookSecret?: string
}

// Load from environment
const config: VietQRConfig = {
    bankCode: process.env.VIETQR_BANK_CODE || 'MB',
    accountNumber: process.env.VIETQR_ACCOUNT_NUMBER || '',
    accountName: process.env.VIETQR_ACCOUNT_NAME || 'NERD SOCIETY',
    template: (process.env.VIETQR_TEMPLATE as VietQRConfig['template']) || 'compact2',
    // For auto-verification (register at vietqr.vn)
    clientId: process.env.VIETQR_CLIENT_ID,
    apiKey: process.env.VIETQR_API_KEY,
    webhookSecret: process.env.VIETQR_WEBHOOK_SECRET,
}

/**
 * Generate VietQR image URL
 * Uses https://img.vietqr.io service
 */
export function generateVietQRUrl(params: {
    amount: number
    description: string
}) {
    const { amount, description } = params

    // Sanitize description (remove special chars, limit length)
    const sanitizedDesc = description
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .substring(0, 50)
        .trim()

    // Build URL
    // Format: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={DESCRIPTION}
    const baseUrl = 'https://img.vietqr.io/image'
    const imagePath = `${config.bankCode}-${config.accountNumber}-${config.template}.png`

    const queryParams = new URLSearchParams({
        amount: amount.toString(),
        addInfo: sanitizedDesc,
        accountName: config.accountName,
    })

    return `${baseUrl}/${imagePath}?${queryParams.toString()}`
}

/**
 * Generate payment info for display
 */
export function getPaymentInfo(params: {
    amount: number
    bookingCode: string
}) {
    const description = `Thanh toan ${params.bookingCode}`

    return {
        qrUrl: generateVietQRUrl({
            amount: params.amount,
            description,
        }),
        bankCode: config.bankCode,
        accountNumber: config.accountNumber,
        accountName: config.accountName,
        amount: params.amount,
        description,
    }
}

/**
 * Check if VietQR is configured (basic - for QR generation)
 */
export function isVietQRConfigured(): boolean {
    return !!(config.bankCode && config.accountNumber && config.accountName)
}

/**
 * Check if VietQR auto-verification is configured
 */
export function isAutoVerifyEnabled(): boolean {
    return !!(config.clientId && config.apiKey)
}

/**
 * Verify VietQR webhook signature
 * VietQR sends a signature in the header for verification
 */
export function verifyVietQRWebhook(
    payload: Record<string, unknown>,
    signature: string | null
): boolean {
    // If no webhook secret configured, skip verification (development mode)
    if (!config.webhookSecret) {
        console.warn('[VietQR] Webhook secret not configured, skipping verification')
        return true
    }

    if (!signature) {
        return false
    }

    try {
        // Create signature from payload
        const payloadStr = JSON.stringify(payload)
        const expectedSignature = crypto
            .createHmac('sha256', config.webhookSecret)
            .update(payloadStr)
            .digest('hex')

        return signature === expectedSignature
    } catch (error) {
        console.error('[VietQR] Signature verification error:', error)
        return false
    }
}

/**
 * Generate VietQR code via API (for advanced features)
 * Requires API credentials from vietqr.vn
 */
export async function generateVietQRViaAPI(params: {
    amount: number
    description: string
    orderId: string
}): Promise<{ qrDataURL: string; qrCode: string } | null> {
    if (!config.clientId || !config.apiKey) {
        console.warn('[VietQR] API credentials not configured, using image URL instead')
        return null
    }

    try {
        const response = await fetch('https://api.vietqr.io/v2/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': config.clientId,
                'x-api-key': config.apiKey,
            },
            body: JSON.stringify({
                accountNo: config.accountNumber,
                accountName: config.accountName,
                acqId: config.bankCode,
                amount: params.amount,
                addInfo: params.description,
                format: 'text',
                template: config.template,
            }),
        })

        if (!response.ok) {
            throw new Error(`VietQR API error: ${response.status}`)
        }

        const data = await response.json()
        return {
            qrDataURL: data.data?.qrDataURL || '',
            qrCode: data.data?.qrCode || '',
        }
    } catch (error) {
        console.error('[VietQR] API error:', error)
        return null
    }
}
