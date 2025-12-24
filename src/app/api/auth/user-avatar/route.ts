import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// GET /api/auth/user-avatar - Get current user's avatar
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ avatar: null })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { avatar: true },
        })

        return NextResponse.json({ avatar: user?.avatar || null })
    } catch (error) {
        console.error('Error fetching user avatar:', error)
        return NextResponse.json({ avatar: null })
    }
}
