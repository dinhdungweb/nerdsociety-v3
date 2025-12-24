import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { canView } from '@/lib/apiPermissions'

const FLOATING_BUTTONS_KEY = 'floating_buttons'

const DEFAULT_BUTTONS = [
    {
        id: 'default-phone',
        label: 'Gọi ngay',
        type: 'phone',
        value: '0368483689',
        icon: 'phone',
        bgColor: '#a5916e',
        textColor: '#ffffff',
        isActive: true,
        order: 1,
    },
    {
        id: 'default-chat',
        label: 'Chat hỗ trợ',
        type: 'chat',
        value: '',
        icon: 'chat',
        bgColor: '#a5916e',
        textColor: '#ffffff',
        isActive: true,
        order: 2,
    },
]

// GET - Fetch floating buttons config
export async function GET() {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: FLOATING_BUTTONS_KEY },
        })

        if (setting) {
            const buttons = JSON.parse(setting.value)
            return NextResponse.json({ buttons })
        }

        return NextResponse.json({ buttons: DEFAULT_BUTTONS })
    } catch (error) {
        console.error('Error fetching floating buttons:', error)
        return NextResponse.json({ buttons: DEFAULT_BUTTONS })
    }
}

// POST - Save floating buttons config (Settings permission required)
export async function POST(request: NextRequest) {
    try {
        const { session, hasAccess } = await canView('Settings')
        if (!session || !hasAccess) {
            return NextResponse.json({ error: 'Không có quyền thay đổi cài đặt' }, { status: 403 })
        }

        const { buttons } = await request.json()

        if (!Array.isArray(buttons)) {
            return NextResponse.json({ error: 'Invalid buttons data' }, { status: 400 })
        }

        await prisma.setting.upsert({
            where: { key: FLOATING_BUTTONS_KEY },
            update: { value: JSON.stringify(buttons) },
            create: { key: FLOATING_BUTTONS_KEY, value: JSON.stringify(buttons) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving floating buttons:', error)
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }
}
