import { NextResponse } from 'next/server'

/**
 * @deprecated This API endpoint is deprecated.
 * Please use /api/booking/create instead.
 * 
 * The new API uses Room + Service model instead of Combo.
 */
export async function POST() {
    return NextResponse.json(
        {
            error: 'This endpoint is deprecated. Please use /api/booking/create instead.',
            newEndpoint: '/api/booking/create',
        },
        { status: 410 } // Gone
    )
}

