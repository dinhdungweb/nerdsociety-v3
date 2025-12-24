import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, password } = body

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Thiếu thông tin' },
                { status: 400 }
            )
        }

        // Verify token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        })

        if (!verificationToken) {
            return NextResponse.json(
                { error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' },
                { status: 400 }
            )
        }

        if (new Date() > verificationToken.expires) {
            // Delete expired token
            await prisma.verificationToken.delete({
                where: { token },
            })
            return NextResponse.json(
                { error: 'Link đặt lại mật khẩu đã hết hạn.' },
                { status: 400 }
            )
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, 12)

        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { password: hashedPassword },
        })

        // Delete token
        await prisma.verificationToken.delete({
            where: { token },
        })

        return NextResponse.json(
            { message: 'Đặt lại mật khẩu thành công.' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi' },
            { status: 500 }
        )
    }
}
