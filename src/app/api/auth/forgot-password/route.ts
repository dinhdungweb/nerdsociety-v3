import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Vui lòng điền email' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            // Return success even if user not found for security
            return NextResponse.json(
                { message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' },
                { status: 200 }
            )
        }

        // Generate token
        const token = uuidv4()
        const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

        // Save token
        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        })

        // Send email
        await sendPasswordResetEmail(email, token)

        return NextResponse.json(
            { message: 'Email đặt lại mật khẩu đã được gửi.' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi' },
            { status: 500 }
        )
    }
}
