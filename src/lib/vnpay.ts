import { format } from 'date-fns'
import crypto from 'crypto'

interface VNPayConfig {
    tmnCode: string
    hashSecret: string
    url: string
    returnUrl: string
}

const config: VNPayConfig = {
    tmnCode: process.env.VNPAY_TMN_CODE || '',
    hashSecret: process.env.VNPAY_HASH_SECRET || '',
    url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/payment/vnpay/return',
}

export function generateVNPayUrl(params: {
    amount: number
    orderId: string
    orderInfo: string
    ipAddr: string
    bankCode?: string
}) {
    const date = new Date()
    const createDate = format(date, 'yyyyMMddHHmmss')

    const vnpParams: Record<string, string | number> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: params.orderId,
        vnp_OrderInfo: params.orderInfo,
        vnp_OrderType: 'other',
        vnp_Amount: params.amount * 100,
        vnp_ReturnUrl: config.returnUrl,
        vnp_IpAddr: params.ipAddr,
        vnp_CreateDate: createDate,
    }

    if (params.bankCode) {
        vnpParams['vnp_BankCode'] = params.bankCode
    }

    // Sort params
    const sortedParams = sortObject(vnpParams)

    // Create signature
    const signData = stringifyParams(sortedParams)
    const hmac = crypto.createHmac('sha512', config.hashSecret)
    const signed = hmac.update(signData, 'utf-8').digest('hex')

    vnpParams['vnp_SecureHash'] = signed

    // Construct final URL
    const query = new URLSearchParams()
    Object.entries(vnpParams).forEach(([key, value]) => {
        query.append(key, value.toString())
    })

    return `${config.url}?${query.toString()}`
}

export function verifyVNPayReturn(vnpParams: Record<string, string>) {
    const secureHash = vnpParams['vnp_SecureHash']

    // Create a new object excluding hash params
    const paramsToSign: Record<string, string | number> = {}
    Object.keys(vnpParams).forEach(key => {
        if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
            paramsToSign[key] = vnpParams[key]
        }
    })

    const sortedParams = sortObject(paramsToSign)
    const signData = stringifyParams(sortedParams)

    const hmac = crypto.createHmac('sha512', config.hashSecret)
    const signed = hmac.update(signData, 'utf-8').digest('hex')

    return secureHash === signed
}

function sortObject(obj: Record<string, any>) {
    const sorted: Record<string, any> = {}
    const keys = Object.keys(obj).sort()

    for (const key of keys) {
        sorted[key] = obj[key]
    }

    return sorted
}

function stringifyParams(params: Record<string, any>) {
    return Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
}
