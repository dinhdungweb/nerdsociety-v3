import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export const metadata: Metadata = {
    title: 'Cài đặt tài khoản',
}

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            gender: true,
            dateOfBirth: true,
            address: true,
            bio: true,
        },
    })

    if (!user) redirect('/login')

    return <SettingsForm user={user} />
}
