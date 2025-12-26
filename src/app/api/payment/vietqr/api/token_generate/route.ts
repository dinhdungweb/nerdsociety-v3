import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs' // đảm bảo chạy Node runtime (jwt)

/**
 * Helper: Error response format theo VietQR spec
 */
function jsonError(message: string, status = 400) {
    return NextResponse.json(
        { status: 'FAILED', message },
        { status }
    )
}

/**
 * POST /api/payment/vietqr/api/token_generate
 * 
 * Endpoint required by VietQR.vn integration.
 * VietQR system calls this to get an access token before calling the webhook.
 * 
 * Auth: Basic Auth (Username/Password provided by USER in VietQR portal)
 */
export async function POST(request: NextRequest) {
    try {
        // 0) Check env config
        const JWT_SECRET = process.env.VIETQR_WEBHOOK_SECRET
        const expectedUser = process.env.VIETQR_PARTNER_USER
        const expectedPass = process.env.VIETQR_PARTNER_PASS

        if (!JWT_SECRET || !expectedUser || !expectedPass) {
            console.error('[VietQR Token] Missing env: VIETQR_WEBHOOK_SECRET, VIETQR_PARTNER_USER, or VIETQR_PARTNER_PASS')
            return jsonError('SERVER_MISCONFIG', 500)
        }

        // 1) Verify Authorization header (Basic Auth)
        const authHeader = request.headers.get('authorization')
        console.log('[VietQR Token] Auth Header:', authHeader)

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return jsonError('E74') // E74: Authorization header is missing or invalid
        }

        // 2) Decode Basic Auth
        let username: string
        let password: string
        try {
            const base64Credentials = authHeader.split(' ')[1]
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
            const parts = credentials.split(':')
            if (parts.length < 2) {
                return jsonError('E74')
            }
            username = parts[0]
            password = parts.slice(1).join(':') // Handle password containing ':'
        } catch {
            return jsonError('E74')
        }

        // 3) Verify credentials
        if (username !== expectedUser || password !== expectedPass) {
            console.log('[VietQR Token] Auth failed for user:', username)
            return jsonError('E74') // Invalid credentials
        }

        // 4) Generate JWT Token
        // VietQR expects HS512 algorithm, token expires in 300 seconds
        const token = jwt.sign(
            { user: username, type: 'vietqr_webhook' },
            JWT_SECRET,
            {
                algorithm: 'HS512',
                expiresIn: 300
            }
        )

        // 5) Return success response (VietQR spec)
        return NextResponse.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 300
        })

    } catch (error) {
        console.error('[VietQR Token] Fatal error:', error)
        return jsonError('E05', 500) // E05: Unknown error
    }
}
