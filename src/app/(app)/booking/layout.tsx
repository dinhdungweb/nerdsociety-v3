import HeaderNerd from '@/components/landing/HeaderNerd'
import FooterNerd from '@/components/landing/FooterNerd'
import BookingBanner from '@/components/booking/BookingBanner'
import { prisma } from '@/lib/prisma'
import React from 'react'

async function getSiteSettings() {
    const settings = await prisma.setting.findMany()
    const config = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string }) => {
        acc[curr.key] = curr.value
        return acc
    }, {} as Record<string, string>)
    return config
}

export default async function BookingLayout({ children }: { children: React.ReactNode }) {
    const config = await getSiteSettings()

    return (
        <>
            <HeaderNerd logoUrl={config.siteLogo} logoLightUrl={config.siteLogoLight} />
            <main className="pt-20">
                <BookingBanner
                    enabled={config.bookingBannerEnabled !== 'false'}
                    image={config.bookingBannerImage}
                    title={config.bookingBannerTitle}
                    subtitle={config.bookingBannerSubtitle}
                    ctaText={config.bookingBannerCtaText}
                    ctaLink={config.bookingBannerCtaLink}
                />
                {children}
            </main>
            <FooterNerd logoUrl={config.siteLogo} />
        </>
    )
}
