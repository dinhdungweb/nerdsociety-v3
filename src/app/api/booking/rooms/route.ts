import { prisma } from '@/lib/prisma'
import { RoomType, ServiceType } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Map ServiceType to RoomType
 */
function serviceTypeToRoomTypes(serviceType: ServiceType): RoomType[] {
    switch (serviceType) {
        case 'MEETING':
            return ['MEETING_LONG', 'MEETING_ROUND']
        case 'POD_MONO':
            return ['POD_MONO']
        case 'POD_MULTI':
            return ['POD_MULTI']
        default:
            return []
    }
}

/**
 * GET /api/booking/rooms?locationId=xxx&serviceType=MEETING
 * Lấy danh sách rooms theo location và service type
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const locationId = searchParams.get('locationId')
        const serviceType = searchParams.get('serviceType') as ServiceType | null

        // Validate required params
        if (!locationId) {
            return NextResponse.json(
                { error: 'locationId is required' },
                { status: 400 }
            )
        }

        // Build where clause
        const where: Record<string, unknown> = {
            locationId,
            isActive: true,
        }

        // Filter by room type if serviceType provided
        if (serviceType) {
            const roomTypes = serviceTypeToRoomTypes(serviceType)
            if (roomTypes.length > 0) {
                where.type = { in: roomTypes }
            }
        }

        const rooms = await prisma.room.findMany({
            where,
            select: {
                id: true,
                name: true,
                type: true,
                description: true,
                capacity: true,
                amenities: true,
                image: true,
            },
            orderBy: [
                { type: 'asc' },
                { name: 'asc' },
            ],
        })

        return NextResponse.json({ rooms })
    } catch (error) {
        console.error('Error fetching rooms:', error)
        return NextResponse.json(
            { error: 'Failed to fetch rooms' },
            { status: 500 }
        )
    }
}
