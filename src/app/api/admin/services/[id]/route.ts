import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { invalidateServicePricingCache } from '@/lib/pricing-db'
import { canView, canManage } from '@/lib/apiPermissions'

// GET - Lấy chi tiết Service
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check view permission
        const { hasAccess } = await canView('Services')
        if (!hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xem dịch vụ' }, { status: 403 })
        }

        const { id } = await params
        const service = await prisma.service.findUnique({
            where: { id },
        })

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }

        return NextResponse.json(service)
    } catch (error) {
        console.error('Error fetching service:', error)
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
    }
}

// PUT - Cập nhật Service
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check manage permission for updating
        const { hasAccess } = await canManage('Services')
        if (!hasAccess) {
            return NextResponse.json({ error: 'Không có quyền chỉnh sửa dịch vụ' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const {
            name,
            description,
            priceSmall,
            priceLarge,
            priceFirstHour,
            pricePerHour,
            nerdCoinReward,
            minDuration,
            timeStep,
            features,
            icon,
            image,
            isActive,
        } = body

        const service = await prisma.service.update({
            where: { id },
            data: {
                name,
                description,
                priceSmall: priceSmall !== undefined ? (priceSmall ? parseInt(priceSmall) : null) : undefined,
                priceLarge: priceLarge !== undefined ? (priceLarge ? parseInt(priceLarge) : null) : undefined,
                priceFirstHour: priceFirstHour !== undefined ? (priceFirstHour ? parseInt(priceFirstHour) : null) : undefined,
                pricePerHour: pricePerHour !== undefined ? (pricePerHour ? parseInt(pricePerHour) : null) : undefined,
                nerdCoinReward: nerdCoinReward !== undefined ? parseInt(nerdCoinReward) : undefined,
                minDuration: minDuration !== undefined ? parseInt(minDuration) : undefined,
                timeStep: timeStep !== undefined ? parseInt(timeStep) : undefined,
                features,
                icon,
                image,
                isActive,
            },
        })

        // Invalidate pricing cache so new prices take effect immediately
        invalidateServicePricingCache()

        return NextResponse.json(service)
    } catch (error) {
        console.error('Error updating service:', error)
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
    }
}

// DELETE - Xóa Service
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check manage permission for deleting
        const { hasAccess } = await canManage('Services')
        if (!hasAccess) {
            return NextResponse.json({ error: 'Không có quyền xóa dịch vụ' }, { status: 403 })
        }

        const { id } = await params

        await prisma.service.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting service:', error)
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
    }
}
