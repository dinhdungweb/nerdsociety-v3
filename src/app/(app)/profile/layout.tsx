import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import ProfileHeader from '@/components/profile/ProfileHeader'
import HeaderNerd from '@/components/landing/HeaderNerd'
import FooterNerd from '@/components/landing/FooterNerd'

async function getSiteSettings() {
    const settings = await prisma.setting.findMany()
    const config = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {} as Record<string, string>)
    return config
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    const [config, user] = await Promise.all([
        getSiteSettings(),
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                avatar: true,
                nerdCoinBalance: true,
                nerdCoinTier: true,
            },
        }),
    ])

    return (
        <>
            <HeaderNerd logoUrl={config.siteLogo} logoLightUrl={config.siteLogoLight} />
            <div className="min-h-screen bg-neutral-50 pb-16 pt-24 dark:bg-neutral-950">
                <div className="container">
                    {/* Profile Header with User Info & Tabs */}
                    <ProfileHeader
                        user={{
                            name: user?.name || null,
                            email: user?.email || null,
                            avatar: user?.avatar || null,
                            nerdCoinBalance: user?.nerdCoinBalance || 0,
                            nerdCoinTier: user?.nerdCoinTier || 'BRONZE',
                        }}
                    />

                    {/* Page Content */}
                    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
                        {children}
                    </div>
                </div>
            </div>
            <FooterNerd logoUrl={config.siteLogoLight || config.siteLogo} />
        </>
    )
}
